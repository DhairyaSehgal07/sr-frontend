import type {
  DaybookEntry,
  DaybookOrderDetail,
  DaybookOutgoingEntry,
  DaybookPagination,
  DaybookStorageEntry,
  DaybookStorageGatePassSnapshot,
} from '@/features/daybook/api/types';
import type { StorageGatePassPagination } from '@/features/storage/api/types';

export type OutgoingBreakdownRow = {
  type: string;
  variety: string;
  location: string;
  refGatePassNo: number | null;
  avail: number;
  issued: number;
  rem: number;
  weightInKg?: number;
};

export type OutgoingBreakdownTotals = {
  avail: number;
  issued: number;
  rem: number;
};

export function displayVoucherNo(entry: DaybookEntry): string {
  if (entry.manualGatePassNumber != null) {
    return `${entry.gatePassNo} (${entry.manualGatePassNumber})`;
  }
  return String(entry.gatePassNo);
}

export function formatDaybookLocation(chamber: string, floor: string, row: string): string {
  const parts = [chamber, floor, row].filter((part) => part.trim().length > 0);
  if (parts.length === 0) return '—';
  return `Ch ${chamber} / Fl ${floor} / Row ${row}`;
}

export function formatDaybookLocationCompact(chamber: string, floor: string, row: string): string {
  const parts = [chamber, floor, row].map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return '—';
  return parts.join('-');
}

function findRefGatePassNo(
  detail: DaybookOrderDetail,
  snapshots: DaybookStorageGatePassSnapshot[],
): number | null {
  for (const snapshot of snapshots) {
    const matches = snapshot.bagSizes.some(
      (bag) =>
        bag.size.trim() === detail.size.trim() &&
        bag.chamber.trim() === detail.chamber.trim() &&
        bag.floor.trim() === detail.floor.trim() &&
        bag.row.trim() === detail.row.trim(),
    );
    if (matches) return snapshot.gatePassNo;
  }

  return snapshots[0]?.gatePassNo ?? null;
}

export function buildOutgoingBreakdownRows(entry: DaybookOutgoingEntry): OutgoingBreakdownRow[] {
  return entry.orderDetails.map((detail) => {
    const issued = detail.quantityIssued;
    const rem = detail.quantityAvailable;
    const avail = rem + issued;

    return {
      type: detail.size,
      variety: entry.variety,
      location: formatDaybookLocationCompact(detail.chamber, detail.floor, detail.row),
      refGatePassNo: findRefGatePassNo(detail, entry.storageGatePassSnapshots),
      avail,
      issued,
      rem,
      weightInKg: detail.weightInKg,
    };
  });
}

export function sumOutgoingBreakdownTotals(rows: OutgoingBreakdownRow[]): OutgoingBreakdownTotals {
  return rows.reduce(
    (totals, row) => ({
      avail: totals.avail + row.avail,
      issued: totals.issued + row.issued,
      rem: totals.rem + row.rem,
    }),
    { avail: 0, issued: 0, rem: 0 },
  );
}

export function totalStorageBags(entry: DaybookStorageEntry): number {
  return entry.bagSizes.reduce((sum, bag) => sum + bag.initialQuantity, 0);
}

export function totalCurrentStorageBags(entry: DaybookStorageEntry): number {
  return entry.bagSizes.reduce((sum, bag) => sum + bag.currentQuantity, 0);
}

export function totalIssuedBags(entry: DaybookOutgoingEntry): number {
  return entry.orderDetails.reduce((sum, detail) => sum + detail.quantityIssued, 0);
}

const weightKgFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export function formatWeightKg(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return weightKgFormatter.format(value);
}

/** Distinct average bag weights recorded on the outgoing pass. */
export function uniqueOutgoingWeightsKg(entry: DaybookOutgoingEntry): number[] {
  const seen = new Set<number>();
  const weights: number[] = [];

  for (const detail of entry.orderDetails) {
    if (detail.weightInKg == null || Number.isNaN(detail.weightInKg)) continue;
    if (seen.has(detail.weightInKg)) continue;
    seen.add(detail.weightInKg);
    weights.push(detail.weightInKg);
  }

  return weights;
}

export function formatDaybookDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDaybookDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function paginationRangeLabel(pagination: DaybookPagination): string {
  if (pagination.totalItems === 0) {
    return 'Showing 0 of 0';
  }

  const rangeStart = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const rangeEnd = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    pagination.totalItems,
  );

  return `Showing ${rangeStart.toLocaleString('en-IN')}–${rangeEnd.toLocaleString('en-IN')} of ${pagination.totalItems.toLocaleString('en-IN')}`;
}

export function storagePaginationToDaybook(
  pagination: StorageGatePassPagination,
): DaybookPagination {
  const { page, limit, total, totalPages } = pagination;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };
}
