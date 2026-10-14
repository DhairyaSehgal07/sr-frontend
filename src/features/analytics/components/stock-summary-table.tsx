import {
  type ColumnDef,
  columnVisibilityFeature,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Package } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBags } from '@/features/finances/lib/format';
import { cn } from '@/lib/utils';

import type { StockCell, StockMatrix, StockMatrixRow } from '../lib/stock-matrix';

const stockSummaryTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    numeric: (rowA, rowB, columnId) => {
      const left = Number(rowA.getValue(columnId));
      const right = Number(rowB.getValue(columnId));
      const a = Number.isFinite(left) ? left : 0;
      const b = Number.isFinite(right) ? right : 0;
      if (a === b) return 0;
      return a > b ? 1 : -1;
    },
  },
});

type StockSummaryFeatures = typeof stockSummaryTableFeatures;

const stickyShadow =
  'shadow-[4px_0_8px_-6px_color-mix(in_oklch,var(--foreground)_28%,transparent)]';

type StockSummaryTableProps = {
  matrix: StockMatrix;
  filtered: boolean;
  onCellClick: (variety: string, size: string, cell: StockCell) => void;
};

function Count({ value, emphasize = false }: { value: number; emphasize?: boolean }) {
  return (
    <span
      className={cn(
        'tabular-nums',
        value === 0 && 'text-muted-foreground',
        value > 0 && !emphasize && 'font-medium text-foreground',
        emphasize && value > 0 && 'font-semibold text-primary',
      )}
    >
      {formatBags(value)}
    </span>
  );
}

function SortableHeader({
  column,
  title,
  align = 'left',
}: {
  column: {
    getCanSort: () => boolean;
    getIsSorted: () => false | 'asc' | 'desc';
    toggleSorting: (desc?: boolean) => void;
  };
  title: string;
  align?: 'left' | 'right';
}) {
  if (!column.getCanSort()) {
    return <span className="text-sm font-medium text-muted-foreground">{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 gap-1.5 px-2 font-medium text-muted-foreground hover:text-foreground',
        align === 'right' ? '-mr-2 ml-auto' : '-ml-2',
      )}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'desc' ? (
        <ArrowDown className="size-3.5 shrink-0" aria-hidden />
      ) : sorted === 'asc' ? (
        <ArrowUp className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <ArrowUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
      )}
    </Button>
  );
}

function sizeColumnId(size: string) {
  return `size:${size}`;
}

export function StockSummaryTable({ matrix, filtered, onCellClick }: StockSummaryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<StockSummaryFeatures, StockMatrixRow>[]>(() => {
    const varietyColumn: ColumnDef<StockSummaryFeatures, StockMatrixRow> = {
      id: 'variety',
      accessorKey: 'variety',
      header: ({ column }) => <SortableHeader column={column} title="Varieties" />,
      cell: ({ row }) => (
        <span className="block max-w-36 truncate" title={row.original.variety}>
          {row.original.variety}
        </span>
      ),
      footer: () => 'Bag Total',
    };

    const sizeColumns = matrix.sizes.map((size, index) => {
      const column: ColumnDef<StockSummaryFeatures, StockMatrixRow> = {
        id: sizeColumnId(size),
        accessorFn: (row) => row.cells[index]?.quantity ?? 0,
        sortFn: 'numeric',
        header: ({ column: headerColumn }) => (
          <SortableHeader column={headerColumn} title={size} align="right" />
        ),
        cell: ({ row }) => {
          const cell = row.original.cells[index] ?? { quantity: 0, stockId: null };
          return (
            <button
              type="button"
              className="h-11 w-full px-3 text-right transition-colors hover:bg-muted/80 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none"
              aria-label={
                cell.stockId
                  ? `Edit ${row.original.variety} ${size}, ${formatBags(cell.quantity)} bags`
                  : `Add ${row.original.variety} ${size}`
              }
              onClick={() => onCellClick(row.original.variety, size, cell)}
            >
              <Count value={cell.quantity} />
            </button>
          );
        },
        footer: () => <Count value={matrix.columnTotals[index] ?? 0} />,
      };
      return column;
    });

    const totalColumn: ColumnDef<StockSummaryFeatures, StockMatrixRow> = {
      id: 'total',
      accessorKey: 'total',
      sortFn: 'numeric',
      header: ({ column }) => <SortableHeader column={column} title="Total" align="right" />,
      cell: ({ row }) => <Count value={row.original.total} emphasize />,
      footer: () => <Count value={matrix.grandTotal} emphasize />,
    };

    return [varietyColumn, ...sizeColumns, totalColumn];
  }, [matrix, onCellClick]);

  const table = useTable({
    features: stockSummaryTableFeatures,
    data: matrix.rows,
    columns,
    getRowId: (row) => row.variety,
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (matrix.rows.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>{filtered ? 'No stock for this filter' : 'No stock yet'}</EmptyTitle>
          <EmptyDescription>
            {filtered
              ? 'This filter has no variety and bag size rows.'
              : 'Add a variety and bag size to start the stock summary.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-border">
      <Table className="w-max min-w-full border-separate border-spacing-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const isVariety = header.column.id === 'variety';
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-10 border-b border-border bg-muted px-3 font-medium whitespace-nowrap text-muted-foreground',
                      isVariety
                        ? 'sticky left-0 z-30 min-w-32 border-r text-left'
                        : 'min-w-24 border-l text-right',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group/stock">
              {row.getVisibleCells().map((cell) => {
                const isVariety = cell.column.id === 'variety';
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'border-b border-border text-sm whitespace-nowrap',
                      isVariety
                        ? cn(
                            'sticky left-0 z-20 min-w-32 border-r bg-background px-3 py-2.5 font-medium text-foreground group-hover/stock:bg-muted',
                            stickyShadow,
                          )
                        : cell.column.id === 'total'
                          ? 'border-l px-3 py-2.5 text-right'
                          : 'border-l p-0 text-right',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id} className="hover:bg-transparent">
              {footerGroup.headers.map((header) => {
                const isVariety = header.column.id === 'variety';
                return (
                  <TableCell
                    key={header.id}
                    className={cn(
                      'border-border bg-muted text-sm whitespace-nowrap',
                      isVariety
                        ? cn(
                            'sticky left-0 z-20 min-w-32 border-r px-3 py-2.5 font-medium text-foreground',
                            stickyShadow,
                          )
                        : 'border-l px-3 py-2.5 text-right',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableFooter>
      </Table>
    </div>
  );
}
