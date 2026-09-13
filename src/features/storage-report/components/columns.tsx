import { constructAggregationFn, type ColumnDef } from '@tanstack/react-table';

import type { StorageGatePass, StorageGatePassBagSize } from '@/features/storage/api/types';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

const numberFormatter = new Intl.NumberFormat('en-IN');

export type StorageQuantityMode = 'current' | 'initial';

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const formatQuantity = (quantity: number) => numberFormatter.format(quantity);
const sortText = { sortFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = {
  sortFn: 'reportNumeric' as const,
  sortUndefined: 'last' as const,
};
const sortDate = {
  sortFn: 'reportDate' as const,
  sortUndefined: 'last' as const,
};
const reportEmptyAggregation = constructAggregationFn({
  aggregate: () => null,
});
const reportSumAggregation = constructAggregationFn({
  aggregate: ({ rows, getValue }) =>
    rows.reduce((sum, row) => {
      const value = getValue(row);

      return sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0);
    }, 0),
});
const aggregateNone = {
  aggregationFn: reportEmptyAggregation,
  maxAggregationDepth: Infinity,
};
const aggregateSum = {
  aggregationFn: reportSumAggregation,
  maxAggregationDepth: Infinity,
};

const getBagQuantity = (bag: StorageGatePassBagSize, quantityMode: StorageQuantityMode) =>
  quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity;

const getBagSizeQuantity = (
  row: StorageGatePass,
  size: string,
  quantityMode: StorageQuantityMode,
) =>
  row.bagSizes
    .filter((bag) => bag.size === size)
    .reduce((total, bag) => total + getBagQuantity(bag, quantityMode), 0);

const renderBagSizeValue = (bag: StorageGatePassBagSize, quantityMode: StorageQuantityMode) => {
  const location = [bag.chamber, bag.floor, bag.row].filter(Boolean).join('-');
  const quantity = getBagQuantity(bag, quantityMode);

  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="font-semibold text-foreground">{formatQuantity(quantity)}</div>
      <div className="text-muted-foreground">{bag.bagType}</div>
      {location ? <div className="text-muted-foreground">({location})</div> : null}
    </div>
  );
};

const baseColumns: ColumnDef<ReportFeatures, StorageGatePass>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.farmerStorageLinkId.farmerId.name,
    header: 'Name',
    meta: { emphasize: true, filterLabel: 'Farmer' },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'address',
    accessorFn: (row) => row.farmerStorageLinkId.farmerId.address ?? '-',
    header: 'Address',
    meta: { filterLabel: 'Farmer address', wrap: true },
    ...sortText,
    ...aggregateNone,
  },
  {
    id: 'accountNumber',
    accessorFn: (row) => row.farmerStorageLinkId.accountNumber,
    header: 'Account Number',
    meta: { filterLabel: 'Account number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    accessorKey: 'gatePassNo',
    header: 'Gate Pass No',
    meta: { filterLabel: 'Gate pass number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: 'Manual Gate Pass No',
    meta: { filterLabel: 'Manual gate pass number', numeric: true },
    ...sortNumeric,
    ...aggregateNone,
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>();

      return value == null ? '-' : <span className="tabular-nums">{value}</span>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      filterLabel: 'Date',
      filterValueFormatter: (value) => formatDate(String(value ?? '')),
      mono: true,
    },
    ...sortDate,
    ...aggregateNone,
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: 'variety',
    header: 'Variety',
    meta: { filterLabel: 'Variety' },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    meta: { filterLabel: 'Stage' },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
  {
    accessorKey: 'storageCategory',
    header: 'Storage Category',
    meta: { filterLabel: 'Storage category' },
    ...sortText,
    ...aggregateNone,
  },
];

const totalBagsColumn: ColumnDef<ReportFeatures, StorageGatePass> = {
  accessorKey: 'totalBags',
  header: () => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm leading-tight font-medium">Total</span>
      <span className="text-xs font-normal opacity-70">bags</span>
    </span>
  ),
  meta: {
    align: 'right',
    filterLabel: 'Total bags',
    groupStart: true,
    numeric: true,
  },
  ...sortNumeric,
  ...aggregateSum,
  cell: ({ getValue }) => {
    const value = getValue<number | undefined>();

    return value == null ? (
      '-'
    ) : (
      <span className="font-medium tabular-nums">{formatQuantity(value)}</span>
    );
  },
};

const trailingColumns: ColumnDef<ReportFeatures, StorageGatePass>[] = [
  {
    id: 'createdBy',
    accessorFn: (row) => row.createdBy?.name ?? '-',
    header: 'Created By',
    meta: { filterLabel: 'Created by' },
    ...sortText,
    ...aggregateNone,
  },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
    meta: { filterLabel: 'Remarks', wrap: true },
    ...sortText,
    ...aggregateNone,
    cell: ({ getValue }) => getValue<string | undefined>() || '-',
  },
];

export function getStorageReportColumns(
  rows: StorageGatePass[],
  quantityMode: StorageQuantityMode = 'current',
): ColumnDef<ReportFeatures, StorageGatePass>[] {
  const sizes = Array.from(new Set(rows.flatMap((row) => row.bagSizes.map((bag) => bag.size))));

  const sizeColumns: ColumnDef<ReportFeatures, StorageGatePass>[] = sizes.map((size) => ({
    id: `size-${size}`,
    accessorFn: (row) => getBagSizeQuantity(row, size, quantityMode),
    header: size,
    meta: {
      align: 'right',
      filterLabel: size,
      groupStart: true,
      numeric: true,
    },
    ...sortNumeric,
    ...aggregateSum,
    cell: ({ cell, getValue, row }) => {
      if (cell.getIsAggregated()) {
        return <span className="tabular-nums">{formatQuantity(getValue<number>() ?? 0)}</span>;
      }

      const bags = row.original.bagSizes.filter((bag) => bag.size === size);

      if (!bags.length) return '-';

      return (
        <div className="space-y-3">
          {bags.map((bag, index) => (
            <div key={`${bag.size}-${bag.bagType}-${bag.chamber}-${bag.floor}-${bag.row}-${index}`}>
              {renderBagSizeValue(bag, quantityMode)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [...baseColumns, totalBagsColumn, ...sizeColumns, ...trailingColumns];
}

export const columns: ColumnDef<ReportFeatures, StorageGatePass>[] = getStorageReportColumns([]);
