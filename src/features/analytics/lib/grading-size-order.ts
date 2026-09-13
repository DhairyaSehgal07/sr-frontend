/** Preferred column order for grading size names (unknown sizes appended alphabetically). */
export const GRADING_SIZE_ORDER = [
  'Below 30',
  '30–40',
  '35–40',
  '40–45',
  '45–50',
  '50–55',
  'Above 50',
  'Above 55',
  'Cut',
] as const;

export function orderGradingSizeNames(sizeNames: Iterable<string>): string[] {
  const set = new Set(sizeNames);
  const known = GRADING_SIZE_ORDER.filter((size) => set.has(size));
  const rest = [...set]
    .filter((size) => !known.includes(size as (typeof GRADING_SIZE_ORDER)[number]))
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...rest];
}
