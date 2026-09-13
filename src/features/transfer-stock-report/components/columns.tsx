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

import type { TransferStockReportRow } from '@/features/transfer-stock-report/api/types';
import {
  createReportTotalFooter,
  ReportTotalLabel,
} from '@/features/transfer-stock-report/components/report-totals-footer';
import {
  formatIndianInteger,
  parseReportNumber,
} from '@/features/transfer-stock-report/utils/report-formatters';
import { cn } from '@/lib/utils';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

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

function reportDateCell({
  getValue,
}: CellContext<ReportFeatures, TransferStockReportRow, unknown>) {
  const formatted = formatReportDate(getValue());

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function indianIntegerCell(options?: { emphasize?: boolean }) {
  return ({ getValue }: CellContext<ReportFeatures, TransferStockReportRow, unknown>) => {
    const formatted = formatIndianInteger(getValue());

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

export const columns: ColumnDef<ReportFeatures, TransferStockReportRow>[] = [
  {
    accessorKey: 'from',
    header: reportColumnHeader('From'),
    footer: ReportTotalLabel,
    meta: { filterLabel: 'From farmer' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'fromAccountNumber',
    header: reportColumnHeader('From A/c', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'From account number',
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'to',
    header: reportColumnHeader('To'),
    meta: { groupStart: true, filterLabel: 'To farmer' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'toAccountNumber',
    header: reportColumnHeader('To A/c', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'To account number',
    },
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
      filterLabel: 'Transfer gate pass no',
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
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'category',
    header: reportColumnHeader('Category'),
    meta: { filterLabel: 'Category' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'stage',
    header: reportColumnHeader('Stage'),
    meta: { filterLabel: 'Stage' },
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
    accessorKey: 'totalBags',
    header: reportColumnHeader('Bags', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      emphasize: true,
      groupStart: true,
      filterLabel: 'Bags',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianIntegerCell({ emphasize: true }),
    footer: createReportTotalFooter('totalBags', 'integer', {
      emphasize: true,
    }),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'outgoingGatePassNo',
    header: reportColumnHeader('Outgoing GP', {
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      groupStart: true,
      filterLabel: 'Outgoing gate pass no',
    },
    ...sortNumeric,
  },
  {
    accessorKey: 'destinationStorageGatePassNo',
    header: reportColumnHeader('Dest. storage GP', {
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Destination storage gate pass no',
    },
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

export type { TransferStockReportRow };
