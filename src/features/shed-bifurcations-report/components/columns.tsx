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

import type { ShedBifurcationRow } from '@/features/shed-bifurcations-report/api/types';
import {
  createReportTotalFooter,
  ReportTotalLabel,
} from '@/features/shed-bifurcations-report/components/report-totals-footer';
import {
  formatIndianInteger,
  parseReportNumber,
} from '@/features/shed-bifurcations-report/utils/report-formatters';
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

function reportTextCell({ getValue }: CellContext<ReportFeatures, ShedBifurcationRow, unknown>) {
  const value = String(getValue() ?? '').trim();

  if (!value) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span>{value}</span>;
}

function reportIssuedCell({ row }: CellContext<ReportFeatures, ShedBifurcationRow, unknown>) {
  const lines = row.original.initialBagLines;

  if (lines.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {lines.map((line, index) => (
        <span key={`${line.size}-${index}`} className="tabular-nums">
          <span>{line.size || '—'}</span>
          <span className="ml-2 font-medium">{line.quantity.toLocaleString('en-IN')}</span>
        </span>
      ))}
    </div>
  );
}

function reportLinesCell({ row }: CellContext<ReportFeatures, ShedBifurcationRow, unknown>) {
  const lines = row.original.lines;

  if (lines.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {lines.map((line, index) => (
        <span key={`${line.toSize}-${index}`} className="tabular-nums">
          <span>{line.toSize || '—'}</span>
          <span className="ml-2 font-medium">{line.quantity.toLocaleString('en-IN')}</span>
        </span>
      ))}
    </div>
  );
}

function reportDateCell({ getValue }: CellContext<ReportFeatures, ShedBifurcationRow, unknown>) {
  const formatted = formatReportDate(getValue());

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function indianIntegerCell(options?: { emphasize?: boolean }) {
  return ({ getValue }: CellContext<ReportFeatures, ShedBifurcationRow, unknown>) => {
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

export const columns: ColumnDef<ReportFeatures, ShedBifurcationRow>[] = [
  {
    accessorKey: 'createdAt',
    header: reportColumnHeader('Date'),
    footer: ReportTotalLabel,
    meta: {
      filterLabel: 'Date',
      filterValueFormatter: formatDateFilterValue,
    },
    cell: reportDateCell,
    ...aggregateUnique,
    ...sortDate,
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
    cell: indianIntegerCell(),
    ...sortNumeric,
  },
  {
    accessorKey: 'manualGatePassNumber',
    header: reportColumnHeader('Manual no.', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Manual gate pass number',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianIntegerCell(),
    ...sortNumeric,
  },
  {
    accessorKey: 'shed',
    header: reportColumnHeader('Shed'),
    meta: { filterLabel: 'Shed' },
    cell: reportTextCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
    cell: reportTextCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'farmerName',
    header: reportColumnHeader('Farmer'),
    meta: { filterLabel: 'Farmer' },
    cell: reportTextCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'accountNumber',
    header: reportColumnHeader('Account', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      mono: true,
      filterLabel: 'Account number',
    },
    cell: reportTextCell,
    ...sortNumeric,
  },
  {
    accessorKey: 'issuedText',
    header: reportColumnHeader('Issued', { align: 'right' }),
    meta: { align: 'right', filterLabel: 'Issued' },
    cell: reportIssuedCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'fromSize',
    header: reportColumnHeader('From size'),
    meta: { filterLabel: 'From size' },
    cell: reportTextCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'linesText',
    header: reportColumnHeader('Lines', { align: 'right' }),
    meta: { align: 'right', filterLabel: 'Lines' },
    cell: reportLinesCell,
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'lineQuantity',
    header: reportColumnHeader('Quantity', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      emphasize: true,
      filterLabel: 'Quantity',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianIntegerCell({ emphasize: true }),
    footer: createReportTotalFooter('lineQuantity', 'integer', { emphasize: true }),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'remarks',
    header: reportColumnHeader('Remarks'),
    meta: { wrap: true, filterLabel: 'Remarks' },
    cell: reportTextCell,
    ...aggregateUnique,
    ...sortText,
  },
];

export type { ShedBifurcationRow };
