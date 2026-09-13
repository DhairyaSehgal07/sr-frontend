import { BAG_SIZES } from '@/lib/constants';

/** Preferred column order for bag size names (unknown sizes appended alphabetically). */
export function orderBagSizeNames(sizeNames: Iterable<string>): string[] {
  const set = new Set(sizeNames);
  const known = BAG_SIZES.filter((size) => set.has(size));
  const rest = [...set]
    .filter((size) => !known.includes(size as (typeof BAG_SIZES)[number]))
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...rest];
}
