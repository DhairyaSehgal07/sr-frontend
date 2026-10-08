import {
  type CellContext,
  type Column,
  type ColumnDef,
  constructAggregationFn,
  type HeaderContext,
  type RowData,
} from '@tanstack/react-table';
import { format, isValid, parse, parseISO } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { OutgoingReportRow } from '@/features/outgoing-report/api/types';
import {
  createReportTotalFooter,
  createSizeTotalFooter,
  ReportTotalLabel,
} from '@/features/outgoing-report/components/report-totals-footer';
import {
  formatIndianInteger,
  formatIndianWeight,
  parseReportNumber,
  sumBagSizeQuantityForRow,
} from '@/features/outgoing-report/utils/report-formatters';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import { cn } from '@/lib/utils';

type ReportColumnHeaderAlign = 'left' | 'right';

/* eslint-disable react-refresh/only-export-components -- internal column header helpers */

interface ReportColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<ReportFeatures, TData, TValue>;
  /** Passed explicitly so React Compiler re-renders when sort state changes */
  sorted: false | 'asc' | 'desc';
  title: string;
  unit?: string;
  align?: ReportColumnHeaderAlign;
  numeric?: boolean;
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />;
  }

  if (sorted === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />;
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />;
}

function ReportColumnHeader<TData extends RowData, TValue>({
  column,
  sorted,
  title,
  unit,
  align = 'left',
  numeric = false,
}: ReportColumnHeaderProps<TData, TValue>) {
  const isActive = sorted !== false;

  return (
    <button
      type="button"
      className={cn(
        'flex w-full min-w-0 items-center gap-1.5 rounded-md text-inherit transition-colors',
        'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        align === 'right' ? 'justify-end text-right' : 'justify-between text-left',
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {unit ? (
        <span
          className={cn(
            'flex min-w-0 flex-col gap-0.5',
            align === 'right' && 'items-end text-right',
          )}
        >
          <span className={cn('text-sm font-medium leading-tight', numeric && 'tabular-nums')}>
            {title}
          </span>
          <span className="text-xs font-normal opacity-70">{unit}</span>
        </span>
      ) : (
        <span
          className={cn(
            'min-w-0 truncate text-sm font-medium leading-tight',
            numeric && 'tabular-nums',
          )}
        >
          {title}
        </span>
      )}

      <span
        className={cn(
          'shrink-0 text-muted-foreground transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0 group-hover/head:opacity-70',
        )}
      >
        <SortIcon sorted={sorted} />
      </span>
    </button>
  );
}

/* eslint-enable react-refresh/only-export-components */

type HeaderOptions = {
  unit?: string;
  align?: 'left' | 'right';
  numeric?: boolean;
};

/** ColumnDef header factory with sortable label + hover icon */
function reportColumnHeader<TData extends RowData>(title: string, options?: HeaderOptions) {
  return ({ column }: HeaderContext<ReportFeatures, TData, unknown>) => (
    <ReportColumnHeader column={column} sorted={column.getIsSorted()} title={title} {...options} />
  );
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  const raw = String(value).trim();
  if (raw.length === 0) return null;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? parse(raw, 'yyyy-MM-dd', new Date())
    : parseISO(raw);

  if (!isValid(parsed)) return raw;

  return format(parsed, 'do MMMM yyyy');
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

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
};

const PRE_SOWING_LABELS: Record<string, string> = {
  true: 'Yes',
  false: 'No',
};

function getStatusLabel(value: string) {
  return STATUS_LABELS[value] ?? value;
}

function getPreSowingLabel(value: string) {
  return PRE_SOWING_LABELS[value] ?? value;
}

function formatStatusFilterValue(value: unknown): string {
  if (value == null || value === '') return 'Blank';
  return getStatusLabel(String(value));
}

function formatPreSowingFilterValue(value: unknown): string {
  if (value == null || value === '') return 'Blank';
  return getPreSowingLabel(String(value));
}

function reportDateCell({ getValue }: CellContext<ReportFeatures, OutgoingReportRow, unknown>) {
  const formatted = formatReportDate(getValue());

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function emptyDash() {
  return <span className="text-sm text-muted-foreground">—</span>;
}

function textCell({ getValue }: CellContext<ReportFeatures, OutgoingReportRow, unknown>) {
  const value = String(getValue() ?? '').trim();
  if (!value) return emptyDash();
  return value;
}

function indianNumberCell(format: 'integer' | 'weight', options?: { emphasize?: boolean }) {
  return ({ getValue }: CellContext<ReportFeatures, OutgoingReportRow, unknown>) => {
    const formatted =
      format === 'integer' ? formatIndianInteger(getValue()) : formatIndianWeight(getValue());

    if (formatted == null) {
      return emptyDash();
    }

    return (
      <span className={cn('tabular-nums', options?.emphasize && 'font-semibold')}>{formatted}</span>
    );
  };
}

const sortText = { sortFn: 'text' as const, sortUndefined: 'last' as const };
const sortNumeric = {
  sortFn: 'reportNumeric' as const,
  sortUndefined: 'last' as const,
};
const sortDate = { sortFn: 'reportDate' as const, sortUndefined: 'last' as const };
const aggregateUnique = {
  aggregationFn: 'uniqueCount' as const,
  maxAggregationDepth: Infinity,
};
const reportSumAggregation = constructAggregationFn({
  aggregate: ({ rows, getValue }) =>
    rows.reduce((sum, row) => {
      const parsed = parseReportNumber(getValue(row));
      return sum + (parsed ?? 0);
    }, 0),
});
const aggregateSum = {
  aggregationFn: reportSumAggregation,
  maxAggregationDepth: Infinity,
};

function formatOrderLocation(item: OutgoingReportRow['orderDetails'][number]) {
  return [item.chamber, item.floor, item.row].filter(Boolean).join(' / ');
}

function renderSizeCell(row: OutgoingReportRow, size: string) {
  const items = row.orderDetails.filter((item) => item.size === size);

  if (items.length === 0) {
    return emptyDash();
  }

  return (
    <div className="space-y-2 text-right">
      {items.map((item, index) => {
        const quantity = formatIndianInteger(item.quantityIssued);
        const location = formatOrderLocation(item);

        return (
          <div key={`${item.size}-${item.bagType}-${location}-${index}`} className="space-y-0.5">
            <div className="font-semibold tabular-nums text-foreground">{quantity ?? '—'}</div>
            {item.bagType ? (
              <div className="text-xs font-medium text-muted-foreground">{item.bagType}</div>
            ) : null}
            {location ? (
              <div className="text-xs font-medium text-muted-foreground">{location}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const leadingColumns: ColumnDef<ReportFeatures, OutgoingReportRow>[] = [
  {
    accessorKey: 'name',
    header: reportColumnHeader('Name'),
    footer: ReportTotalLabel,
    meta: { filterLabel: 'Farmer', emphasize: true },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'address',
    header: reportColumnHeader('Address'),
    meta: { filterLabel: 'Farmer address', wrap: true },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'accountNumber',
    header: reportColumnHeader('Account', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Account number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: reportColumnHeader('Manual GP', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      groupStart: true,
      filterLabel: 'Manual gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
  {
    accessorKey: 'gatePassNo',
    header: reportColumnHeader('Gate pass', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
  {
    accessorKey: 'date',
    header: reportColumnHeader('Date'),
    meta: {
      groupStart: true,
      filterLabel: 'Date',
      filterValueFormatter: formatDateFilterValue,
    },
    cell: reportDateCell,
    ...aggregateUnique,
    ...sortDate,
  },
  {
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'status',
    header: reportColumnHeader('Status'),
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: formatStatusFilterValue,
    },
    ...aggregateUnique,
    ...sortText,
    cell: ({ row }) => {
      const value = row.getValue<string>('status');
      if (!value) return emptyDash();

      const isActive = value === 'ACTIVE';

      return (
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={cn(
            'text-xs font-semibold',
            isActive &&
              'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25',
          )}
        >
          {getStatusLabel(value)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'category',
    header: reportColumnHeader('Category'),
    meta: { filterLabel: 'Category' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'from',
    header: reportColumnHeader('From'),
    meta: { filterLabel: 'From' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'to',
    header: reportColumnHeader('To'),
    meta: { filterLabel: 'To' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'truckNumber',
    header: reportColumnHeader('Truck'),
    meta: { mono: true, filterLabel: 'Truck number' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'transportCompany',
    header: reportColumnHeader('Transport'),
    meta: { filterLabel: 'Transport company' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'lsNumber',
    header: reportColumnHeader('LS no.'),
    meta: { mono: true, filterLabel: 'LS number' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'driverName',
    header: reportColumnHeader('Driver'),
    meta: { filterLabel: 'Driver' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'driverMobile',
    header: reportColumnHeader('Driver mobile', { numeric: true }),
    meta: { numeric: true, mono: true, filterLabel: 'Driver mobile' },
    cell: textCell,
    ...sortText,
  },
  {
    accessorKey: 'owner',
    header: reportColumnHeader('Owner'),
    meta: { filterLabel: 'Owner' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'shed',
    header: reportColumnHeader('Shed'),
    meta: { filterLabel: 'Shed' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'preSowingTreatment',
    header: reportColumnHeader('Pre-sowing'),
    meta: {
      groupStart: true,
      filterLabel: 'Pre-sowing treatment',
      filterValueFormatter: formatPreSowingFilterValue,
    },
    ...aggregateUnique,
    ...sortText,
    cell: ({ row }) => {
      const value = row.getValue<string>('preSowingTreatment');
      if (!value) return emptyDash();
      return getPreSowingLabel(value);
    },
  },
  {
    accessorKey: 'billNumber',
    header: reportColumnHeader('Bill no.', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Bill number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
  {
    accessorKey: 'biltiNumber',
    header: reportColumnHeader('Bilti no.', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Bilti number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
  {
    accessorKey: 'billBook',
    header: reportColumnHeader('Bill book'),
    meta: { filterLabel: 'Bill book' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'biltiBook',
    header: reportColumnHeader('Bilti book'),
    meta: { filterLabel: 'Bilti book' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'costPerBag',
    header: reportColumnHeader('Cost', { unit: 'per bag', align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Cost per bag',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    ...sortNumeric,
  },
];

const totalBagsColumn: ColumnDef<ReportFeatures, OutgoingReportRow> = {
  accessorKey: 'totalBags',
  header: reportColumnHeader('Total', { unit: 'bags', align: 'right', numeric: true }),
  meta: {
    align: 'right',
    numeric: true,
    emphasize: true,
    groupStart: true,
    filterLabel: 'Total bags',
    filterValueFormatter: formatIntegerFilterValue,
  },
  cell: indianNumberCell('integer', { emphasize: true }),
  footer: createReportTotalFooter('totalBags', 'integer', { emphasize: true }),
  ...aggregateSum,
  ...sortNumeric,
};

const trailingColumns: ColumnDef<ReportFeatures, OutgoingReportRow>[] = [
  {
    accessorKey: 'netWeightKg',
    header: reportColumnHeader('Net', {
      unit: 'kg',
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      emphasize: true,
      groupStart: true,
      filterLabel: 'Net weight',
      filterValueFormatter: formatWeightFilterValue,
    },
    cell: indianNumberCell('weight', { emphasize: true }),
    footer: createReportTotalFooter('netWeightKg', 'weight', {
      emphasize: true,
    }),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'createdBy',
    header: reportColumnHeader('Created by'),
    meta: { groupStart: true, filterLabel: 'Created by' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'remarks',
    header: reportColumnHeader('Remarks'),
    meta: { wrap: true, filterLabel: 'Remarks' },
    cell: textCell,
    ...aggregateUnique,
    ...sortText,
  },
];

export function getOutgoingReportColumns(
  rows: OutgoingReportRow[],
): ColumnDef<ReportFeatures, OutgoingReportRow>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.orderDetails.map((item) => item.size).filter(Boolean))),
  );

  const sizeColumns: ColumnDef<ReportFeatures, OutgoingReportRow>[] = sizes.map((size, index) => ({
    id: `size-${size}`,
    accessorFn: (row) => sumBagSizeQuantityForRow(row.orderDetails, size),
    header: reportColumnHeader(size, { unit: 'bags', align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      groupStart: index === 0,
      filterLabel: `${size} bags`,
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: ({ row, getValue }) => {
      if (row.getIsGrouped()) {
        const formatted = formatIndianInteger(getValue());
        return formatted ? (
          <span className="font-semibold tabular-nums">{formatted}</span>
        ) : (
          emptyDash()
        );
      }

      return renderSizeCell(row.original, size);
    },
    footer: createSizeTotalFooter(size),
    ...aggregateSum,
    ...sortNumeric,
  }));

  return [...leadingColumns, totalBagsColumn, ...sizeColumns, ...trailingColumns];
}

export const columns = getOutgoingReportColumns([]);
