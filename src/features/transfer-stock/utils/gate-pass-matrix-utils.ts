import type {
  DatePassGroup,
  LocationFilters,
  StorageGatePass,
  StorageGatePassBagSlot,
  TransferAllocationKey,
  TransferStockItem,
  VarietyItemGroup,
  VoucherSort,
} from '@/features/transfer-stock/types/storage-gate-pass';

/** Unit separator — size names may contain `|`. */
const KEY_SEP = '\u001f';

export type StorageGatePassFilterParams = {
  variety?: string;
  search?: string;
  location?: LocationFilters;
};

export function filterStorageGatePasses(
  passes: StorageGatePass[],
  { variety, search, location }: StorageGatePassFilterParams,
): StorageGatePass[] {
  let list = passes;
  if (variety?.trim()) {
    const v = variety.trim();
    list = list.filter((p) => p.variety?.trim() === v);
  }
  if (search?.trim()) {
    list = list.filter((p) => passMatchesGatePassSearch(p, search));
  }
  if (location) {
    list = list.filter((p) => passMatchesLocationFilters(p, location));
  }
  return list;
}

export function allocationKey(
  passId: string,
  sizeName: string,
  bagIndex: number,
): TransferAllocationKey {
  return `${passId}${KEY_SEP}${sizeName}${KEY_SEP}${bagIndex}`;
}

export function parseAllocationKey(key: string): {
  passId: string;
  sizeName: string;
  bagIndex: number;
} | null {
  const parts = key.split(KEY_SEP);
  if (parts.length < 3) return null;
  const bagIndex = Number.parseInt(parts.at(-1) ?? '', 10);
  if (Number.isNaN(bagIndex)) return null;
  const passId = parts[0] ?? '';
  const sizeName = parts.slice(1, -1).join(KEY_SEP);
  if (!passId || !sizeName) return null;
  return { passId, sizeName, bagIndex };
}

export type BagSlotDetail = StorageGatePassBagSlot & { bagIndex: number };

export function getBagSlotsForSize(pass: StorageGatePass, sizeName: string): BagSlotDetail[] {
  const slots: BagSlotDetail[] = [];
  pass.bagSizes.forEach((bag, index) => {
    if (bag.size.trim() === sizeName.trim()) {
      slots.push({ ...bag, bagIndex: index });
    }
  });
  return slots;
}

export function getUniqueSizes(passes: StorageGatePass[]): string[] {
  const names = new Set<string>();
  for (const pass of passes) {
    for (const bag of pass.bagSizes) {
      const name = bag.size?.trim();
      if (name) names.add(name);
    }
  }
  return [...names].sort();
}

export function getUniqueVarieties(passes: StorageGatePass[]): string[] {
  const names = new Set<string>();
  for (const pass of passes) {
    const v = pass.variety?.trim();
    if (v) names.add(v);
  }
  return [...names].sort();
}

export function getUniqueLocationValues(passes: StorageGatePass[]): {
  chambers: string[];
  floors: string[];
  rows: string[];
} {
  const chambers = new Set<string>();
  const floors = new Set<string>();
  const rows = new Set<string>();

  for (const pass of passes) {
    for (const bag of pass.bagSizes) {
      if (bag.chamber?.trim()) chambers.add(bag.chamber.trim());
      if (bag.floor?.trim()) floors.add(bag.floor.trim());
      if (bag.row?.trim()) rows.add(bag.row.trim());
    }
  }

  return {
    chambers: [...chambers].sort(),
    floors: [...floors].sort(),
    rows: [...rows].sort(),
  };
}

export function passMatchesGatePassSearch(pass: StorageGatePass, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const gate = String(pass.gatePassNo);
  const manual = String(pass.manualGatePassNumber);
  return gate.includes(q) || manual.includes(q);
}

export function passMatchesLocationFilters(
  pass: StorageGatePass,
  filters: LocationFilters,
): boolean {
  const { chamber, floor, row } = filters;
  if (!chamber && !floor && !row) return true;

  return pass.bagSizes.some((bag) => {
    if (chamber && bag.chamber?.trim() !== chamber) return false;
    if (floor && bag.floor?.trim() !== floor) return false;
    if (row && bag.row?.trim() !== row) return false;
    return true;
  });
}

function formatGroupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function groupPassesByDate(passes: StorageGatePass[], sort: VoucherSort): DatePassGroup[] {
  const sorted = [...passes].sort((a, b) => {
    const na = a.gatePassNo ?? 0;
    const nb = b.gatePassNo ?? 0;
    return sort === 'asc' ? na - nb : nb - na;
  });

  const byDate = new Map<string, StorageGatePass[]>();
  for (const pass of sorted) {
    const dateKey = pass.date.slice(0, 10);
    const list = byDate.get(dateKey) ?? [];
    list.push(pass);
    byDate.set(dateKey, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
    .map(([dateKey, groupPasses]) => ({
      dateKey,
      dateLabel: formatGroupDate(groupPasses[0]?.date ?? dateKey),
      passes: groupPasses,
    }));
}

export function buildAllocationsFromPass(
  pass: StorageGatePass,
  visibleSizes: string[],
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const size of visibleSizes) {
    const details = getBagSlotsForSize(pass, size);
    for (const detail of details) {
      if (detail.currentQuantity > 0) {
        next[allocationKey(pass._id, size, detail.bagIndex)] = detail.currentQuantity;
      }
    }
  }
  return next;
}

export function findPassAndSlot(
  passes: StorageGatePass[],
  passId: string,
  sizeName: string,
  bagIndex: number,
): { pass: StorageGatePass; slot: BagSlotDetail } | null {
  const pass = passes.find((p) => p._id === passId);
  if (!pass) return null;
  const slot = getBagSlotsForSize(pass, sizeName).find((s) => s.bagIndex === bagIndex);
  if (!slot) return null;
  return { pass, slot };
}

export function buildTransferItems(
  allocations: Record<string, number>,
  passes: StorageGatePass[],
): TransferStockItem[] {
  const items: TransferStockItem[] = [];

  for (const [key, quantity] of Object.entries(allocations)) {
    if (quantity <= 0) continue;
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const found = findPassAndSlot(passes, parsed.passId, parsed.sizeName, parsed.bagIndex);
    if (!found) continue;

    items.push({
      storageGatePassId: parsed.passId,
      gatePassNo: found.pass.gatePassNo,
      variety: found.pass.variety?.trim() || 'Unspecified',
      bagSize: parsed.sizeName,
      bagIndex: parsed.bagIndex,
      quantity,
      bagType: found.slot.bagType,
      location: {
        chamber: found.slot.chamber,
        floor: found.slot.floor,
        row: found.slot.row,
      },
    });
  }

  return items;
}

export function groupItemsByVariety(items: TransferStockItem[]): VarietyItemGroup[] {
  const byVariety = new Map<string, TransferStockItem[]>();

  for (const item of items) {
    const variety = item.variety?.trim() || 'Unspecified';
    const group = byVariety.get(variety) ?? [];
    group.push(item);
    byVariety.set(variety, group);
  }

  return [...byVariety.entries()].map(([variety, groupItems]) => ({
    variety,
    items: groupItems,
  }));
}

export function formatLocationShort(slot: StorageGatePassBagSlot): string {
  return `Ch: ${slot.chamber} · F: ${slot.floor} · R: ${slot.row}`;
}

export function totalAllocatedBags(allocations: Record<string, number>): number {
  return Object.values(allocations).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
}
