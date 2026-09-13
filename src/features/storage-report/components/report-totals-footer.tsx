import type { Row } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { StorageGatePass } from '@/features/storage/api/types';
import { cn } from '@/lib/utils';

import type { StorageQuantityMode } from './columns';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatTotalValue(value: number) {
  return numberFormatter.format(value);
}

function renderTotalValue(value: number) {
  return (
    <span className="font-semibold tabular-nums text-foreground">{formatTotalValue(value)}</span>
  );
}

function sumBagSizeQuantity(
  rows: readonly Row<ReportFeatures, StorageGatePass>[],
  size: string,
  quantityMode: StorageQuantityMode,
) {
  return rows.reduce((total, row) => {
    return (
      total +
      row.original.bagSizes
        .filter((bag) => bag.size === size)
        .reduce(
          (sum, bag) =>
            sum + (quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity),
          0,
        )
    );
  }, 0);
}

export function ReportTotalLabel() {
  return <span className="text-sm font-semibold text-foreground">Total</span>;
}

export function getStorageReportFooterContent(
  columnId: string,
  rows: readonly Row<ReportFeatures, StorageGatePass>[],
  quantityMode: StorageQuantityMode,
) {
  if (columnId === 'totalBags') {
    const total = rows.reduce(
      (sum, row) => sum + (typeof row.original.totalBags === 'number' ? row.original.totalBags : 0),
      0,
    );

    return renderTotalValue(total);
  }

  if (!columnId.startsWith('size-')) {
    return null;
  }

  const total = sumBagSizeQuantity(rows, columnId.replace(/^size-/, ''), quantityMode);

  return renderTotalValue(total);
}

export const storageReportFooterCellClassName = cn(
  'bg-muted/70 px-3 py-3 align-middle text-sm backdrop-blur-sm',
  'supports-[backdrop-filter]:bg-muted/60',
);
