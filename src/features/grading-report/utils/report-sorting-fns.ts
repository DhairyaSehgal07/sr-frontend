import { isValid, parse, parseISO } from 'date-fns';

import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import { parseReportNumber } from '@/features/grading-report/utils/report-formatters';
import type { ReportSortFn } from '@/lib/tanstack-table/report-table-features';

function parseReportDateValue(value: unknown): number | null {
  if (value == null || value === '') return null;

  const raw = String(value).trim();
  if (raw.length === 0) return null;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? parse(raw, 'yyyy-MM-dd', new Date())
    : parseISO(raw);

  if (!isValid(parsed)) return null;

  return parsed.getTime();
}

export const reportNumericSortingFn: ReportSortFn<GradingGatePassReportRow> = (
  rowA,
  rowB,
  columnId,
) => {
  const a = parseReportNumber(rowA.getValue(columnId));
  const b = parseReportNumber(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};

export const reportDateSortingFn: ReportSortFn<GradingGatePassReportRow> = (
  rowA,
  rowB,
  columnId,
) => {
  const a = parseReportDateValue(rowA.getValue(columnId));
  const b = parseReportDateValue(rowB.getValue(columnId));

  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  return a === b ? 0 : a > b ? 1 : -1;
};
