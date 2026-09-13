import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
  flexRender,
  useTable,
} from '@tanstack/react-table';
import { ClipboardList, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table-pagination';
import { gradingFormTableFeatures, type GradingFormTableFeatures } from './table-features';

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<GradingFormTableFeatures, TData>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  isLoading?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});

  const isRowSelectionControlled = controlledRowSelection !== undefined;
  const rowSelection = isRowSelectionControlled ? controlledRowSelection : internalRowSelection;

  const handleRowSelectionChange = React.useCallback<OnChangeFn<RowSelectionState>>(
    (updater) => {
      const next = resolveUpdater(updater, rowSelection);
      if (controlledOnRowSelectionChange) {
        controlledOnRowSelectionChange(next);
      } else {
        setInternalRowSelection(next);
      }
    },
    [controlledOnRowSelectionChange, rowSelection],
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useTable<GradingFormTableFeatures, TData>({
    features: gradingFormTableFeatures,
    data,
    columns,
    getRowId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: handleRowSelectionChange,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    autoResetPageIndex: true,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const manualFilter = table.getColumn('manualGatePassNumber')?.getFilterValue();
  const hasActiveFilter = typeof manualFilter === 'string' && manualFilter.length > 0;
  const rows = table.getPaginatedRowModel().rows;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">Available gate passes</p>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? 'Loading incoming gate passes…'
              : `${filteredCount.toLocaleString('en-IN')} pass${filteredCount === 1 ? '' : 'es'} · select rows to grade`}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search manual #…"
            value={
              (table.getColumn('manualGatePassNumber')?.getFilterValue() as string | undefined) ??
              ''
            }
            inputMode="numeric"
            disabled={isLoading}
            onChange={(event) =>
              table.getColumn('manualGatePassNumber')?.setFilterValue(event.target.value)
            }
            className="h-10 pl-9 text-base sm:text-sm"
            aria-label="Filter by manual gate pass number"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/50 [&_tr]:border-b [&_tr]:hover:bg-transparent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align =
                    (header.column.columnDef.meta as { align?: 'left' | 'right' } | undefined)
                      ?.align ?? 'left';

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-10 px-3 text-muted-foreground',
                        header.column.id === 'select' && 'w-12 px-2',
                        align === 'right' && 'text-right',
                      )}
                      style={
                        header.column.getSize() !== 150
                          ? { width: header.column.getSize() }
                          : undefined
                      }
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={col.id ?? `col-${colIndex}`} className="py-2.5">
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="even:bg-muted/20"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align =
                      (cell.column.columnDef.meta as { align?: 'left' | 'right' } | undefined)
                        ?.align ?? 'left';

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-2.5',
                          cell.column.id === 'select' && 'w-12 px-2',
                          align === 'right' && 'text-right',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty className="rounded-none border-0 border-dashed bg-muted/10 py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>
                        {hasActiveFilter ? 'No matching gate passes' : 'No gate passes to show'}
                      </EmptyTitle>
                      <EmptyDescription>
                        {hasActiveFilter
                          ? 'Try a different manual number or clear the search.'
                          : 'Choose a farmer and variety above, or check back when new passes arrive.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <DataTablePagination
          table={table}
          pagination={pagination}
          className="border-t border-border/60 bg-muted/30"
        />
      )}
    </div>
  );
}
