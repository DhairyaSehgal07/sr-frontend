import { constructAggregationFn, type ColumnDef } from '@tanstack/react-table';
import { format, isValid, parseISO } from 'date-fns';

import type {
  GradingGatePassReportFarmerStorageLink,
  GradingGatePassReportOrderDetail,
  GradingGatePassReportRow,
} from '../api/types';
import {
  formatIndianInteger,
  formatIndianPercentage,
  formatIndianWeight,
  getIncomingGatePassObjects,
  parseReportNumber,
} from '../utils/report-formatters';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

function reportColumnHeader(title: string, unit?: string) {
  return () => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm leading-tight font-medium">{title}</span>
      {unit ? <span className="text-xs font-normal opacity-70">{unit}</span> : null}
    </span>
  );
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  const parsed = parseISO(String(value));
  if (!isValid(parsed)) return String(value);

  return format(parsed, 'do MMMM yyyy');
}

function reportDateCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatReportDate(getValue());

  if (!formatted) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function emptyCell() {
  return <span className="text-muted-foreground">-</span>;
}

const sortText = { sortFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = { sortFn: 'reportNumeric' as const, sortUndefined: 'last' as const };
const sortDate = { sortFn: 'reportDate' as const, sortUndefined: 'last' as const };
const aggregateUnique = {
  aggregationFn: 'uniqueCount' as const,
  maxAggregationDepth: Infinity,
};
const reportEmptyAggregation = constructAggregationFn({
  aggregate: () => null,
});
const reportSumAggregation = constructAggregationFn({
  aggregate: ({ rows, getValue }) =>
    rows.reduce((sum, row) => sum + (parseReportNumber(getValue(row)) ?? 0), 0),
});
const reportAverageAggregation = constructAggregationFn({
  aggregate: ({ rows, getValue }) => {
    const values = rows
      .map((row) => parseReportNumber(getValue(row)))
      .filter((value): value is number => value != null);

    if (!values.length) return null;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  },
});
const aggregateSum = {
  aggregationFn: reportSumAggregation,
  maxAggregationDepth: Infinity,
};
const aggregateAverage = {
  aggregationFn: reportAverageAggregation,
  maxAggregationDepth: Infinity,
};
const aggregateNone = {
  aggregationFn: reportEmptyAggregation,
  maxAggregationDepth: Infinity,
};

type SizeAggregateValue = {
  quantity: number;
  averageWeightPerBagKg: number | null;
  bagTypes: string[];
};

function isSizeAggregateValue(value: unknown): value is SizeAggregateValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'quantity' in value &&
    'averageWeightPerBagKg' in value &&
    'bagTypes' in value
  );
}

function numberCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianWeight(getValue());

  return formatted ? <span className="tabular-nums">{formatted}</span> : emptyCell();
}

function integerCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianInteger(getValue());

  return formatted ? <span className="tabular-nums">{formatted}</span> : emptyCell();
}

function percentageCell({ getValue }: { getValue: () => unknown }) {
  const formatted = formatIndianPercentage(getValue());

  return formatted ? <span className="tabular-nums">{formatted}%</span> : emptyCell();
}

function formatFilterFallback(value: unknown): string {
  if (value == null || value === '') return 'Blank';

  return String(value);
}

function formatDateFilterValue(value: unknown): string {
  return formatReportDate(value) ?? formatFilterFallback(value);
}

function formatIntegerFilterValue(value: unknown): string {
  return formatIndianInteger(value) ?? formatFilterFallback(value);
}

function formatWeightFilterValue(value: unknown): string {
  return formatIndianWeight(value) ?? formatFilterFallback(value);
}

function formatPercentageFilterValue(value: unknown): string {
  const formatted = formatIndianPercentage(value);

  return formatted ? `${formatted}%` : formatFilterFallback(value);
}

function getFarmerObject(link: GradingGatePassReportFarmerStorageLink) {
  if (typeof link !== 'object' || link === null) return null;

  const farmer = link.farmer ?? link.farmerId;

  return typeof farmer === 'object' && farmer !== null ? farmer : null;
}

function getFarmerName(row: GradingGatePassReportRow) {
  const farmer = getFarmerObject(row.farmerStorageLinkId);

  return row.farmer ?? row.name ?? farmer?.name ?? '';
}

function getFarmerAddress(row: GradingGatePassReportRow) {
  const farmer = getFarmerObject(row.farmerStorageLinkId);

  return row.address ?? farmer?.address ?? '';
}

function getFarmerAccountNumber(row: GradingGatePassReportRow) {
  const link = row.farmerStorageLinkId;

  if (row.accountNumber != null) return row.accountNumber;
  if (typeof link === 'object' && link !== null && link.accountNumber != null) {
    return link.accountNumber;
  }

  return '';
}

function getCreatedByName(row: GradingGatePassReportRow) {
  const { createdBy } = row;

  return typeof createdBy === 'object' && createdBy !== null ? createdBy.name : createdBy;
}

function getFirstIncomingGatePassNumber(row: GradingGatePassReportRow) {
  const gatePass = getIncomingGatePassObjects(row)[0];

  return gatePass ? parseReportNumber(gatePass.manualGatePassNumber) : null;
}

function sumIncomingGatePassNumber(
  row: GradingGatePassReportRow,
  key: 'bagsReceived' | 'netWeightKg',
) {
  return getIncomingGatePassObjects(row).reduce(
    (sum, gatePass) => sum + (parseReportNumber(gatePass[key]) ?? 0),
    0,
  );
}

function getIncomingGatePassText(row: GradingGatePassReportRow, key: 'stage' | 'category') {
  return getIncomingGatePassObjects(row)
    .map((gatePass) => gatePass[key])
    .filter(Boolean)
    .join(', ');
}

function sumOrderDetailSizeQuantity(row: GradingGatePassReportRow, size: string) {
  return row.orderDetails.reduce((sum, detail) => {
    if (detail.size !== size) return sum;

    return sum + detail.quantity;
  }, 0);
}

function formatOrderDetailText(detail: GradingGatePassReportOrderDetail) {
  return `${detail.quantity.toLocaleString('en-IN')} bags - ${detail.bagType} (${detail.weightPerBagKg.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 3,
    },
  )})`;
}

function renderOrderDetailValue(detail: GradingGatePassReportOrderDetail) {
  return (
    <div className="space-y-0.5 text-right tabular-nums">
      <div className="text-foreground font-semibold">
        {detail.quantity.toLocaleString('en-IN')} bags
      </div>
      <div className="text-muted-foreground text-xs font-medium">
        {detail.bagType} (
        {detail.weightPerBagKg.toLocaleString('en-IN', {
          maximumFractionDigits: 3,
        })}
        )
      </div>
    </div>
  );
}

function renderSizeAggregateValue(value: SizeAggregateValue) {
  return (
    <div className="space-y-0.5 text-right tabular-nums">
      <div className="text-foreground font-semibold">
        {value.quantity.toLocaleString('en-IN')} bags
      </div>
      {value.averageWeightPerBagKg != null ? (
        <div className="text-muted-foreground text-xs font-medium">
          Avg{' '}
          {value.averageWeightPerBagKg.toLocaleString('en-IN', {
            maximumFractionDigits: 3,
          })}
          {value.bagTypes.length ? ` (${value.bagTypes.join(', ')})` : null}
        </div>
      ) : null}
    </div>
  );
}

const baseColumns: ColumnDef<ReportFeatures, GradingGatePassReportRow>[] = [
  {
    id: 'farmerName',
    accessorFn: getFarmerName,
    header: reportColumnHeader('Name'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value ? <span className="font-medium">{value}</span> : emptyCell();
    },
    meta: { filterLabel: 'Farmer' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    id: 'farmerAddress',
    accessorFn: getFarmerAddress,
    header: reportColumnHeader('Address'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value || emptyCell();
    },
    meta: { wrap: true, filterLabel: 'Farmer address' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    id: 'accountNumber',
    accessorFn: getFarmerAccountNumber,
    header: reportColumnHeader('Account No.'),
    cell: ({ getValue }) => {
      const value = getValue();

      return value ? <span className="tabular-nums">{String(value)}</span> : emptyCell();
    },
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      groupStart: true,
      filterLabel: 'Account number',
    },
    ...aggregateNone,
    ...sortNumeric,
  },
  {
    accessorKey: 'gatePassNo',
    header: reportColumnHeader('Gate Pass'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('gatePassNo')}</div>,
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      emphasize: true,
      filterLabel: 'Gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    ...aggregateNone,
    ...sortNumeric,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: reportColumnHeader('Manual GP'),
    cell: ({ row }) => <div className="tabular-nums">{row.getValue('manualGatePassNumber')}</div>,
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Manual gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    ...aggregateNone,
    ...sortNumeric,
  },
  {
    accessorKey: 'date',
    header: reportColumnHeader('Date'),
    cell: reportDateCell,
    meta: { groupStart: true, filterLabel: 'Date', filterValueFormatter: formatDateFilterValue },
    ...aggregateUnique,
    ...sortDate,
  },
  {
    id: 'createdBy',
    accessorFn: getCreatedByName,
    header: reportColumnHeader('Created by'),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '');

      return value ? <span className="font-medium">{value}</span> : emptyCell();
    },
    meta: { filterLabel: 'Created by' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    id: 'incomingGatePasses',
    header: reportColumnHeader('Incoming Gate Pass'),
    meta: { groupStart: true },
    enableSorting: false,
    columns: [
      {
        id: 'incomingManualGatePassNumber',
        accessorFn: getFirstIncomingGatePassNumber,
        header: reportColumnHeader('Manual GP'),
        meta: {
          align: 'right',
          numeric: true,
          mono: true,
          groupStart: true,
          filterLabel: 'Incoming manual gate pass number',
          filterValueFormatter: formatIntegerFilterValue,
        },
        ...aggregateNone,
        ...sortNumeric,
      },
      {
        id: 'incomingBagsReceived',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'bagsReceived'),
        header: reportColumnHeader('Bags'),
        cell: integerCell,
        meta: {
          align: 'right',
          numeric: true,
          filterLabel: 'Incoming bags',
          filterValueFormatter: formatIntegerFilterValue,
        },
        ...aggregateSum,
        ...sortNumeric,
      },
      {
        id: 'incomingStage',
        accessorFn: (row) => getIncomingGatePassText(row, 'stage'),
        header: reportColumnHeader('Stage'),
        meta: { filterLabel: 'Incoming stage' },
        ...aggregateUnique,
        ...sortText,
      },
      {
        id: 'incomingCategory',
        accessorFn: (row) => getIncomingGatePassText(row, 'category'),
        header: reportColumnHeader('Category'),
        meta: { filterLabel: 'Incoming category' },
        ...aggregateUnique,
        ...sortText,
      },
      {
        id: 'incomingGatePassNetWeightKg',
        accessorFn: (row) => sumIncomingGatePassNumber(row, 'netWeightKg'),
        header: reportColumnHeader('Net', 'kg'),
        cell: numberCell,
        meta: {
          align: 'right',
          numeric: true,
          filterLabel: 'Incoming net weight',
          filterValueFormatter: formatWeightFilterValue,
        },
        ...aggregateSum,
        ...sortNumeric,
      },
    ],
  },
];

const totalBagsColumn: ColumnDef<ReportFeatures, GradingGatePassReportRow> = {
  accessorKey: 'totalBags',
  header: reportColumnHeader('Total', 'bags'),
  cell: integerCell,
  meta: {
    align: 'right',
    numeric: true,
    groupStart: true,
    filterLabel: 'Total bags',
    filterValueFormatter: formatIntegerFilterValue,
  },
  ...aggregateSum,
  ...sortNumeric,
};

const summaryColumns: ColumnDef<ReportFeatures, GradingGatePassReportRow>[] = [
  {
    accessorKey: 'incomingNetWeightKg',
    header: reportColumnHeader('Total Incoming Net', 'kg'),
    cell: numberCell,
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: 'Total incoming net',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'netWeightKg',
    header: reportColumnHeader('Grading Net', 'kg'),
    cell: numberCell,
    meta: {
      align: 'right',
      numeric: true,
      emphasize: true,
      filterLabel: 'Grading net',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'wastageKg',
    header: reportColumnHeader('Wastage', 'kg'),
    cell: numberCell,
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Wastage',
      filterValueFormatter: formatWeightFilterValue,
    },
    ...aggregateAverage,
    ...sortNumeric,
  },
  {
    accessorKey: 'wastagePercentage',
    header: reportColumnHeader('Wastage', '%'),
    cell: percentageCell,
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Wastage percentage',
      filterValueFormatter: formatPercentageFilterValue,
    },
    ...aggregateAverage,
    ...sortNumeric,
  },
];

const remarksColumn: ColumnDef<ReportFeatures, GradingGatePassReportRow> = {
  accessorKey: 'remarks',
  header: reportColumnHeader('Remarks'),
  meta: { wrap: true, groupStart: true, filterLabel: 'Remarks' },
  ...aggregateUnique,
  ...sortText,
};

export function getGradingReportColumns(
  rows: GradingGatePassReportRow[],
): ColumnDef<ReportFeatures, GradingGatePassReportRow>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.orderDetails.map((detail) => detail.size))),
  );

  const sizeColumns: ColumnDef<ReportFeatures, GradingGatePassReportRow>[] = sizes.map((size) => ({
    id: `size-${size}`,
    accessorFn: (row) => sumOrderDetailSizeQuantity(row, size),
    header: reportColumnHeader(size, 'bags'),
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: `${size} bags`,
      filterValueFormatter: formatIntegerFilterValue,
    },
    aggregationFn: constructAggregationFn({
      aggregate: ({ rows }) => {
        const details = rows.flatMap((row) =>
          row.original.orderDetails.filter((detail) => detail.size === size),
        );
        const quantity = details.reduce((sum, detail) => sum + detail.quantity, 0);
        const weights = details
          .map((detail) => ({
            quantity: detail.quantity,
            weight: parseReportNumber(detail.weightPerBagKg),
          }))
          .filter(
            (detail): detail is { quantity: number; weight: number } => detail.weight != null,
          );
        const weightQuantity = weights.reduce((sum, detail) => sum + detail.quantity, 0);
        const averageWeightPerBagKg =
          weights.length && weightQuantity > 0
            ? weights.reduce((sum, detail) => sum + detail.weight * detail.quantity, 0) /
              weightQuantity
            : weights.length
              ? weights.reduce((sum, detail) => sum + detail.weight, 0) / weights.length
              : null;
        const bagTypes = Array.from(
          new Set(details.map((detail) => detail.bagType).filter(Boolean)),
        );

        return { quantity, averageWeightPerBagKg, bagTypes } satisfies SizeAggregateValue;
      },
    }),
    maxAggregationDepth: Infinity,
    ...sortNumeric,
    cell: ({ row, getValue }) => {
      const aggregateValue = getValue();
      if (isSizeAggregateValue(aggregateValue)) return renderSizeAggregateValue(aggregateValue);

      const details = row.original.orderDetails.filter((detail) => detail.size === size);

      if (!details.length) return '-';

      return (
        <div className="space-y-1 tabular-nums">
          {details.map((detail, index) => (
            <div key={`${detail.size}-${detail.bagType}-${detail.weightPerBagKg}-${index}`}>
              {renderOrderDetailValue(detail)}
            </div>
          ))}
        </div>
      );
    },
  }));

  return [...baseColumns, totalBagsColumn, ...sizeColumns, ...summaryColumns, remarksColumn];
}

export const columns: ColumnDef<ReportFeatures, GradingGatePassReportRow>[] = [
  ...baseColumns,
  {
    accessorKey: 'orderDetails',
    header: reportColumnHeader('Order Details'),
    cell: ({ row }) => row.original.orderDetails.map(formatOrderDetailText).join(', '),
    meta: { wrap: true, filterLabel: 'Order details' },
    ...aggregateUnique,
    ...sortText,
  },
  ...summaryColumns,
  remarksColumn,
];
