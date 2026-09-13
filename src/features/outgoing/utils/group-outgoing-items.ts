import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';

/** Unit separator — variety and size names may contain `|`. */
export const OUTGOING_WEIGHT_KEY_SEP = '\u001f';

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

/** Safe record key for TanStack field paths (variety names may contain `.`). */
export function outgoingWeightKey(variety: string, size: string): string {
  return toBase64Url(`${variety}${OUTGOING_WEIGHT_KEY_SEP}${size}`);
}

export type OutgoingQuantityGroup = {
  key: string;
  variety: string;
  size: string;
  quantity: number;
  bagType: string;
  chamber: string;
  floor: string;
  row: string;
};

const MIXED_LABEL = 'Multiple';

function uniqueOrMixed(values: string[]): string {
  const unique = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  if (unique.length === 0) return '—';
  if (unique.length === 1) return unique[0]!;
  return MIXED_LABEL;
}

export function groupOutgoingItemsByVarietyAndSize(
  items: TransferStockItem[],
): OutgoingQuantityGroup[] {
  const byKey = new Map<string, TransferStockItem[]>();

  for (const item of items) {
    if (item.quantity <= 0) continue;
    const variety = item.variety?.trim() || 'Unspecified';
    const size = item.bagSize.trim();
    if (!size) continue;
    const key = outgoingWeightKey(variety, size);
    const group = byKey.get(key) ?? [];
    group.push(item);
    byKey.set(key, group);
  }

  return [...byKey.entries()]
    .map(([key, groupItems]) => {
      const first = groupItems[0]!;
      return {
        key,
        variety: first.variety?.trim() || 'Unspecified',
        size: first.bagSize,
        quantity: groupItems.reduce((sum, item) => sum + item.quantity, 0),
        bagType: uniqueOrMixed(groupItems.map((item) => item.bagType ?? '')),
        chamber: uniqueOrMixed(groupItems.map((item) => item.location.chamber)),
        floor: uniqueOrMixed(groupItems.map((item) => item.location.floor)),
        row: uniqueOrMixed(groupItems.map((item) => item.location.row)),
      };
    })
    .sort((a, b) => a.variety.localeCompare(b.variety) || a.size.localeCompare(b.size));
}

export function lookupOutgoingWeight(
  weightsBySize: Record<string, number | undefined>,
  variety: string,
  size: string,
): number | undefined {
  return weightsBySize[outgoingWeightKey(variety.trim() || 'Unspecified', size)];
}
