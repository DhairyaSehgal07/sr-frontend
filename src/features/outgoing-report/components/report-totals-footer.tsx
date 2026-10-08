import type { Table } from '@tanstack/react-table';
import type { OutgoingReportRow } from '@/features/outgoing-report/api/types';
import {
  formatIndianIntegerTotal,
  formatIndianWeightTotal,
  sumBagSizeQuantity,
  sumReportNumericColumn,
} from '@/features/outgoing-report/utils/report-formatters';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import { cn } from '@/lib/utils';

/* eslint-disable react-refresh/only-export-components -- footer helpers are consumed by column definitions */

type TotalFormat = 'integer' | 'weight';

export function ReportTotalLabel() {
  return <span className="text-sm font-semibold text-foreground">Total</span>;
}

function renderTotal(formatted: string, options?: { emphasize?: boolean }) {
  return (
    <span
      className={cn(
        'tabular-nums font-semibold text-foreground',
        options?.emphasize && 'font-bold',
      )}
    >
      {formatted}
    </span>
  );
}

export function createReportTotalFooter(
  key: keyof OutgoingReportRow,
  format: TotalFormat,
  options?: { emphasize?: boolean },
) {
  return ({ table }: { table: Table<ReportFeatures, OutgoingReportRow> }) => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) return null;

    const total = sumReportNumericColumn(rows, key);
    const formatted =
      format === 'integer' ? formatIndianIntegerTotal(total) : formatIndianWeightTotal(total);

    return renderTotal(formatted, options);
  };
}

export function createSizeTotalFooter(size: string, options?: { emphasize?: boolean }) {
  return ({ table }: { table: Table<ReportFeatures, OutgoingReportRow> }) => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) return null;

    return renderTotal(formatIndianIntegerTotal(sumBagSizeQuantity(rows, size)), options);
  };
}

/* eslint-enable react-refresh/only-export-components */
