import type { Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { TransferStockReportRow } from '@/features/transfer-stock-report/api/types';
import {
  formatIndianIntegerTotal,
  formatIndianWeightTotal,
  sumReportNumericColumn,
} from '@/features/transfer-stock-report/utils/report-formatters';
import { cn } from '@/lib/utils';

/* eslint-disable react-refresh/only-export-components -- footer helpers are consumed by column definitions */

type TotalFormat = 'integer' | 'weight';

export function ReportTotalLabel() {
  return <span className="text-sm font-semibold text-foreground">Total</span>;
}

export function createReportTotalFooter(
  key: keyof TransferStockReportRow,
  format: TotalFormat,
  options?: { emphasize?: boolean },
) {
  return ({ table }: { table: Table<ReportFeatures, TransferStockReportRow> }) => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) return null;

    const total = sumReportNumericColumn(rows, key);
    const formatted =
      format === 'integer' ? formatIndianIntegerTotal(total) : formatIndianWeightTotal(total);

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
  };
}

/* eslint-enable react-refresh/only-export-components */
