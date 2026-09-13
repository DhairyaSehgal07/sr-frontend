import type { Row } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type {
  GradingGatePassReportIncomingGatePass,
  GradingGatePassReportRow,
} from '@/features/grading-report/api/types';

const indianIntegerFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const indianWeightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

const indianPercentageFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
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

export function formatIndianPercentage(value: unknown): string | null {
  const parsed = parseReportNumber(value);
  if (parsed == null) return null;
  return indianPercentageFormatter.format(parsed);
}

export function formatIndianIntegerTotal(total: number): string {
  return indianIntegerFormatter.format(total);
}

export function formatIndianWeightTotal(total: number): string {
  return indianWeightFormatter.format(total);
}

export function formatIndianPercentageTotal(total: number): string {
  return indianPercentageFormatter.format(total);
}

export function getIncomingGatePassObjects(row: GradingGatePassReportRow) {
  return row.incomingGatePassIds.filter(
    (gatePass): gatePass is Exclude<GradingGatePassReportIncomingGatePass, string> =>
      typeof gatePass === 'object' && gatePass !== null,
  );
}

export function sumReportNumericColumn(
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
  key: keyof GradingGatePassReportRow,
): number {
  return rows.reduce((sum, row) => {
    const parsed = parseReportNumber(row.original[key]);
    return sum + (parsed ?? 0);
  }, 0);
}

export function averageReportNumericColumn(
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
  key: keyof GradingGatePassReportRow,
): number | null {
  const values = rows
    .map((row) => parseReportNumber(row.original[key]))
    .filter((value): value is number => value != null);

  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sumIncomingGatePassNumericColumn(
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
  key: 'bagsReceived' | 'netWeightKg',
): number {
  return rows.reduce((sum, row) => {
    const rowTotal = getIncomingGatePassObjects(row.original).reduce(
      (incomingSum, gatePass) => incomingSum + (parseReportNumber(gatePass[key]) ?? 0),
      0,
    );

    return sum + rowTotal;
  }, 0);
}

export function sumOrderDetailSizeQuantity(
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
  size: string,
): number {
  return rows.reduce((sum, row) => {
    const rowTotal = row.original.orderDetails.reduce((detailSum, detail) => {
      if (detail.size !== size) return detailSum;
      return detailSum + detail.quantity;
    }, 0);

    return sum + rowTotal;
  }, 0);
}
