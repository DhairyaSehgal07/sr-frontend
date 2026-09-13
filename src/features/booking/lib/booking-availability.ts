import type { RefinementCtx } from 'zod';

import type { BookingGatePassBagSize } from '@/features/booking/api/types';
import type { SummaryVariety } from '@/features/booking/api/summary-types';
import {
  computeNetAvailable,
  mapApiSummaryToVarietySummary,
} from '@/features/booking/lib/booking-summary-utils';
import type { BookingQuantityRow } from '@/features/booking/schemas/booking-form-schema';
import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';

export function availabilityLineKey(variety: string, size: string): string {
  return `${variety.trim()}\0${size.trim()}`;
}

/** Available bags = storage currentQuantity + shed quantity, per variety and size. */
export function buildNetAvailabilityMap(
  storage: SummaryVariety[],
  booked: SummaryVariety[],
  shed: BookingVarietySummary[] = [],
): Map<string, number> {
  const mappedStorage = mapApiSummaryToVarietySummary(storage, 'current');
  const mappedBooked = mapApiSummaryToVarietySummary(booked, 'current');
  const netAvailable = computeNetAvailable(mappedStorage, mappedBooked, shed);

  const map = new Map<string, number>();

  for (const variety of netAvailable) {
    for (const size of variety.sizes) {
      map.set(availabilityLineKey(variety.variety, size.size), size.quantity);
    }
  }

  return map;
}

export function buildOriginalQtyMap(
  bagSizes: readonly BookingGatePassBagSize[],
): Map<string, number> {
  const map = new Map<string, number>();

  for (const bagSize of bagSizes) {
    const key = availabilityLineKey(bagSize.variety, bagSize.size);
    map.set(key, (map.get(key) ?? 0) + bagSize.currentQuantity);
  }

  return map;
}

export function getNetAvailableQty(
  map: Map<string, number>,
  variety: string,
  size: string,
): number {
  if (!variety.trim() || !size.trim()) return 0;
  return map.get(availabilityLineKey(variety, size)) ?? 0;
}

export function getEffectiveLimit(
  map: Map<string, number>,
  variety: string,
  size: string,
  originalQtyMap?: Map<string, number>,
): number {
  const net = getNetAvailableQty(map, variety, size);
  const original = originalQtyMap?.get(availabilityLineKey(variety, size)) ?? 0;
  return net + original;
}

function sumQtyForKey(
  rows: readonly BookingQuantityRow[],
  variety: string,
  size: string,
  excludeIndex?: number,
): number {
  return rows.reduce((sum, row, index) => {
    if (excludeIndex === index) return sum;
    if (row.variety !== variety || row.size !== size) return sum;
    return sum + (row.qty ?? 0);
  }, 0);
}

export function getRowRemainingQty(
  rows: readonly BookingQuantityRow[],
  rowIndex: number,
  map: Map<string, number>,
  originalQtyMap?: Map<string, number>,
): number {
  const row = rows[rowIndex];
  if (!row?.variety.trim() || !row.size.trim()) return 0;

  const effectiveLimit = getEffectiveLimit(map, row.variety, row.size, originalQtyMap);
  const usedByOthers = sumQtyForKey(rows, row.variety, row.size, rowIndex);

  return Math.max(0, effectiveLimit - usedByOthers);
}

export function refineQuantitiesAgainstAvailability(
  rows: readonly BookingQuantityRow[],
  ctx: RefinementCtx,
  map: Map<string, number>,
  originalQtyMap?: Map<string, number>,
): void {
  if (map.size === 0) return;

  rows.forEach((row, index) => {
    const qty = row.qty ?? 0;
    if (qty <= 0 || !row.variety.trim() || !row.size.trim()) return;

    const remaining = getRowRemainingQty(rows, index, map, originalQtyMap);
    if (qty > remaining) {
      ctx.addIssue({
        code: 'custom',
        message: `Exceeds available quantity (${remaining.toLocaleString('en-IN')} bags).`,
        path: [index, 'qty'],
      });
    }
  });
}
