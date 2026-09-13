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
import type { DispatchReportRow } from '@/features/dispatch-report/api/types';
import {
  createReportTotalFooter,
  createSizeTotalFooter,
  ReportTotalLabel,
} from '@/features/dispatch-report/components/report-totals-footer';
import {
  formatIndianInteger,
  formatIndianWeight,
  parseReportNumber,
  sumBagSizeQuantityForRow,
} from '@/features/dispatch-report/utils/report-formatters';
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

const BOOKED_LABELS: Record<string, string> = {
  true: 'Booked',
  false: 'Not booked',
};

function getBookedLabel(value: string) {
  return BOOKED_LABELS[value] ?? value;
}

function formatBookedFilterValue(value: unknown): string {
  if (value == null || value === '') return 'Blank';
  return getBookedLabel(String(value));
}

function reportDateCell({ getValue }: CellContext<ReportFeatures, DispatchReportRow, unknown>) {
  const formatted = formatReportDate(getValue());

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function indianNumberCell(format: 'integer' | 'weight', options?: { emphasize?: boolean }) {
  return ({ getValue }: CellContext<ReportFeatures, DispatchReportRow, unknown>) => {
    const formatted =
      format === 'integer' ? formatIndianInteger(getValue()) : formatIndianWeight(getValue());

    if (formatted == null) {
      return <span className="text-sm text-muted-foreground">—</span>;
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

function renderSizeCell(row: DispatchReportRow, size: string) {
  const items = row.bagSize.filter((item) => item.size === size);

  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-1 text-right tabular-nums">
      {items.map((item, index) => {
        const quantity = formatIndianInteger(item.quantityIssued);

        return (
          <div key={`${item.size}-${item.variety}-${index}`}>
            <div className="font-semibold text-foreground">{quantity ?? '—'}</div>
            {item.variety ? (
              <div className="text-xs font-medium text-muted-foreground">{item.variety}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const leadingColumns: ColumnDef<ReportFeatures, DispatchReportRow>[] = [
  {
    accessorKey: 'name',
    header: reportColumnHeader('Name'),
    footer: ReportTotalLabel,
    meta: { filterLabel: 'Party' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'address',
    header: reportColumnHeader('Address'),
    meta: { filterLabel: 'Party address' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'mobileNumber',
    header: reportColumnHeader('Mobile', { numeric: true }),
    meta: { numeric: true, mono: true, filterLabel: 'Mobile number' },
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
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'gatePassNo',
    header: reportColumnHeader('Gate pass', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'System generated gate pass no',
    },
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
    accessorKey: 'category',
    header: reportColumnHeader('Category'),
    meta: { filterLabel: 'Category' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'from',
    header: reportColumnHeader('From'),
    meta: { filterLabel: 'From' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'to',
    header: reportColumnHeader('To'),
    meta: { filterLabel: 'To' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'truckNumber',
    header: reportColumnHeader('Truck', { numeric: true }),
    meta: { numeric: true, mono: true, filterLabel: 'Truck number' },
    ...sortNumeric,
  },
  {
    accessorKey: 'isBooked',
    header: reportColumnHeader('Booked'),
    meta: {
      groupStart: true,
      filterLabel: 'Booked',
      filterValueFormatter: formatBookedFilterValue,
    },
    ...aggregateUnique,
    ...sortText,
    cell: ({ row }) => {
      const value = row.getValue<string>('isBooked');
      if (!value) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }

      const isBooked = value === 'true';

      return (
        <Badge
          variant={isBooked ? 'default' : 'secondary'}
          className={cn(
            'text-xs font-semibold',
            isBooked &&
              'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25',
          )}
        >
          {getBookedLabel(value)}
        </Badge>
      );
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
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'bitliNumber',
    header: reportColumnHeader('Bilti no.', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Bilti number',
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'billBook',
    header: reportColumnHeader('Bill book'),
    meta: { filterLabel: 'Bill book' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'biltiBook',
    header: reportColumnHeader('Bilti book'),
    meta: { filterLabel: 'Bilti book' },
    ...aggregateUnique,
    ...sortText,
  },
];

const totalBagsColumn: ColumnDef<ReportFeatures, DispatchReportRow> = {
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

const trailingColumns: ColumnDef<ReportFeatures, DispatchReportRow>[] = [
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
    accessorKey: 'averageWeightPerBag',
    header: reportColumnHeader('Avg', {
      unit: 'kg/bag',
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Average weight per bag',
      filterValueFormatter: formatWeightFilterValue,
    },
    cell: indianNumberCell('weight'),
    ...sortNumeric,
  },
  {
    accessorKey: 'createdBy',
    header: reportColumnHeader('Created by'),
    meta: { groupStart: true, filterLabel: 'Created by' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'remarks',
    header: reportColumnHeader('Remarks'),
    meta: { wrap: true, filterLabel: 'Remarks' },
    ...aggregateUnique,
    ...sortText,
  },
];

export function getDispatchReportColumns(
  rows: DispatchReportRow[],
): ColumnDef<ReportFeatures, DispatchReportRow>[] {
  const sizes = Array.from(
    new Set(rows.flatMap((row) => row.bagSize.map((item) => item.size).filter(Boolean))),
  );

  const sizeColumns: ColumnDef<ReportFeatures, DispatchReportRow>[] = sizes.map((size, index) => ({
    id: `size-${size}`,
    accessorFn: (row) => sumBagSizeQuantityForRow(row.bagSize, size),
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
          <span className="tabular-nums font-semibold">{formatted}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
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

export const columns = getDispatchReportColumns([]);
