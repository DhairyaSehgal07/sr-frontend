import type { Row, Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import {
  averageReportNumericColumn,
  formatIndianIntegerTotal,
  formatIndianPercentageTotal,
  formatIndianWeightTotal,
  sumIncomingGatePassNumericColumn,
  sumOrderDetailSizeQuantity,
  sumReportNumericColumn,
} from '@/features/grading-report/utils/report-formatters';
import { cn } from '@/lib/utils';

/* eslint-disable react-refresh/only-export-components -- footer helpers are consumed by column/table definitions */

type TotalFormat = 'integer' | 'weight' | 'percentage';

function formatTotalValue(value: number, format: TotalFormat) {
  if (format === 'integer') return formatIndianIntegerTotal(value);
  if (format === 'percentage') return formatIndianPercentageTotal(value);
  return formatIndianWeightTotal(value);
}

function renderTotalValue(
  value: number | null,
  format: TotalFormat,
  options?: { emphasize?: boolean; average?: boolean; suffix?: string },
) {
  if (value == null) return null;

  return (
    <span
      className={cn(
        'text-foreground tabular-nums font-semibold',
        options?.emphasize && 'font-bold',
      )}
    >
      {options?.average ? (
        <span className="text-muted-foreground mr-1 font-medium">Avg</span>
      ) : null}
      {formatTotalValue(value, format)}
      {options?.suffix ? (
        <span className="text-muted-foreground font-medium">{options.suffix}</span>
      ) : null}
    </span>
  );
}

export function ReportTotalLabel() {
  return <span className="text-foreground text-sm font-semibold">Total</span>;
}

export function createReportTotalFooter(
  key: keyof GradingGatePassReportRow,
  format: TotalFormat,
  options?: { emphasize?: boolean },
) {
  return ({ table }: { table: Table<ReportFeatures, GradingGatePassReportRow> }) => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) return null;

    return renderTotalValue(sumReportNumericColumn(rows, key), format, options);
  };
}

export function createAverageReportFooter(
  key: keyof GradingGatePassReportRow,
  format: TotalFormat,
  options?: { suffix?: string },
) {
  return ({ table }: { table: Table<ReportFeatures, GradingGatePassReportRow> }) => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) return null;

    return renderTotalValue(averageReportNumericColumn(rows, key), format, {
      average: true,
      suffix: options?.suffix,
    });
  };
}

export function getGradingReportFooterContent(
  columnId: string,
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
) {
  if (columnId.startsWith('size-')) {
    return renderTotalValue(
      sumOrderDetailSizeQuantity(rows, columnId.replace(/^size-/, '')),
      'integer',
    );
  }

  switch (columnId) {
    case 'incomingBagsReceived':
      return renderTotalValue(sumIncomingGatePassNumericColumn(rows, 'bagsReceived'), 'integer');
    case 'incomingGatePassNetWeightKg':
      return renderTotalValue(sumIncomingGatePassNumericColumn(rows, 'netWeightKg'), 'weight');
    case 'totalBags':
      return renderTotalValue(sumReportNumericColumn(rows, 'totalBags'), 'integer');
    case 'incomingNetWeightKg':
      return renderTotalValue(sumReportNumericColumn(rows, 'incomingNetWeightKg'), 'weight');
    case 'netWeightKg':
      return renderTotalValue(sumReportNumericColumn(rows, 'netWeightKg'), 'weight');
    case 'wastageKg':
      return renderTotalValue(averageReportNumericColumn(rows, 'wastageKg'), 'weight', {
        average: true,
      });
    case 'wastagePercentage':
      return renderTotalValue(averageReportNumericColumn(rows, 'wastagePercentage'), 'percentage', {
        average: true,
        suffix: '%',
      });
    default:
      return null;
  }
}

/* eslint-enable react-refresh/only-export-components */
