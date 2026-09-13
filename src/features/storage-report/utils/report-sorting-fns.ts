import type { ReportSortFn } from '@/lib/tanstack-table/report-table-features';
import type { StorageGatePass } from '@/features/storage/api/types';

function parseReportNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (value == null || value === '') return null;

  const parsed = Number(String(value).replaceAll(',', '').trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function parseReportDateValue(value: unknown): number | null {
  if (value == null || value === '') return null;

  const parsed = new Date(String(value));
  const timestamp = parsed.getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

export const reportNumericSortingFn: ReportSortFn<StorageGatePass> = (rowA, rowB, columnId) => {
  const a = parseReportNumber(rowA.getValue(columnId));
  const b = parseReportNumber(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const reportDateSortingFn: ReportSortFn<StorageGatePass> = (rowA, rowB, columnId) => {
  const a = parseReportDateValue(rowA.getValue(columnId));
  const b = parseReportDateValue(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};
