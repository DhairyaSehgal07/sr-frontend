const indianIntegerFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const indianWeightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function parseReportNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const normalized = String(value).replace(/,/g, '').trim();
  if (normalized.length === 0) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatIndianInteger(value: unknown): string | null {
  const parsed = parseReportNumber(value);
  if (parsed == null) return null;
  return indianIntegerFormatter.format(parsed);
}

export function formatIndianWeight(value: unknown): string | null {
  const parsed = parseReportNumber(value);
  if (parsed == null) return null;
  return indianWeightFormatter.format(parsed);
}

export function formatIndianIntegerTotal(total: number): string {
  return indianIntegerFormatter.format(total);
}

export function formatIndianWeightTotal(total: number): string {
  return indianWeightFormatter.format(total);
}

export function sumReportNumericColumn<T extends Record<string, unknown>>(
  rows: readonly { original: T }[],
  key: keyof T,
): number {
  return rows.reduce((sum, row) => {
    const parsed = parseReportNumber(row.original[key]);
    return sum + (parsed ?? 0);
  }, 0);
}
