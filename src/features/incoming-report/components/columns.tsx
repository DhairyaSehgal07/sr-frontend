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
import type { IncomingGatePassReportRow } from '@/features/incoming-report/api/types';
import {
  createReportTotalFooter,
  ReportTotalLabel,
} from '@/features/incoming-report/components/report-totals-footer';
import {
  formatIndianInteger,
  formatIndianWeight,
  parseReportNumber,
} from '@/features/incoming-report/utils/report-formatters';
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

function formatWeightFilterValue(value: unknown): string {
  return formatIndianWeight(value) ?? formatFilterFallback(value);
}

function reportDateCell({
  getValue,
}: CellContext<ReportFeatures, IncomingGatePassReportRow, unknown>) {
  const formatted = formatReportDate(getValue());

  if (formatted == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="whitespace-nowrap">{formatted}</span>;
}

function indianNumberCell(format: 'integer' | 'weight', options?: { emphasize?: boolean }) {
  return ({ getValue }: CellContext<ReportFeatures, IncomingGatePassReportRow, unknown>) => {
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

const STATUS_LABELS: Record<string, string> = {
  NOT_GRADED: 'Not graded',
  GRADED: 'Graded',
};

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
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

export const columns: ColumnDef<ReportFeatures, IncomingGatePassReportRow>[] = [
  {
    accessorKey: 'name',
    header: reportColumnHeader('Name'),
    footer: ReportTotalLabel,
    meta: { filterLabel: 'Farmer' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'address',
    header: reportColumnHeader('Address'),
    meta: { filterLabel: 'Farmer address' },
    ...aggregateUnique,
    ...sortText,
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
    accessorKey: 'variety',
    header: reportColumnHeader('Variety'),
    meta: { filterLabel: 'Variety' },
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
    accessorKey: 'bags',
    header: reportColumnHeader('Bags', { align: 'right', numeric: true }),
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: 'Bags',
      filterValueFormatter: formatIntegerFilterValue,
    },
    cell: indianNumberCell('integer'),
    footer: createReportTotalFooter('bags', 'integer'),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'slipNumber',
    header: reportColumnHeader('Slip no.', { numeric: true }),
    meta: { numeric: true, mono: true, filterLabel: 'Slip number' },
    ...sortNumeric,
  },
  {
    accessorKey: 'grossWeightKg',
    header: reportColumnHeader('Gross', {
      unit: 'kg',
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      groupStart: true,
      filterLabel: 'Gross weight',
      filterValueFormatter: formatWeightFilterValue,
    },
    cell: indianNumberCell('weight'),
    footer: createReportTotalFooter('grossWeightKg', 'weight'),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'tareWeightKg',
    header: reportColumnHeader('Tare', {
      unit: 'kg',
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Tare weight',
      filterValueFormatter: formatWeightFilterValue,
    },
    cell: indianNumberCell('weight'),
    footer: createReportTotalFooter('tareWeightKg', 'weight'),
    ...aggregateSum,
    ...sortNumeric,
  },
  {
    accessorKey: 'bardanaWeightKg',
    header: reportColumnHeader('Bardana', {
      unit: 'kg',
      align: 'right',
      numeric: true,
    }),
    meta: {
      align: 'right',
      numeric: true,
      filterLabel: 'Bardana weight',
      filterValueFormatter: formatWeightFilterValue,
    },
    cell: indianNumberCell('weight'),
    footer: createReportTotalFooter('bardanaWeightKg', 'weight'),
    ...aggregateSum,
    ...sortNumeric,
  },
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
    accessorKey: 'status',
    header: reportColumnHeader('Status'),
    meta: {
      groupStart: true,
      filterLabel: 'Status',
      filterValueFormatter: (value: unknown) =>
        value == null || value === '' ? 'Blank' : getStatusLabel(String(value)),
    },
    ...aggregateUnique,
    ...sortText,
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      if (!status) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }

      const isNotGraded = status === 'NOT_GRADED';

      return (
        <Badge
          variant={isNotGraded ? 'secondary' : 'default'}
          className={cn(
            'text-xs font-semibold',
            !isNotGraded &&
              'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25',
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdBy',
    header: reportColumnHeader('Created by'),
    meta: { filterLabel: 'Created by' },
    ...aggregateUnique,
    ...sortText,
  },
  {
    accessorKey: 'remarks',
    header: reportColumnHeader('Remarks'),
    meta: { wrap: true, groupStart: true, filterLabel: 'Remarks' },
    ...aggregateUnique,
    ...sortText,
  },
];

export type { IncomingGatePassReportRow };
