import { flexRender, type SortingState, useTable } from '@tanstack/react-table';
import { AlertCircle, Plus, Tags } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
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
import type { StockFilterOption } from '@/features/settings/api/stock-filter-types';
import { cn } from '@/lib/utils';

import { getStockFilterColumns } from './stock-filter-columns';
import { billBooksTableFeatures } from './table-features';

type StockFiltersTableProps = {
  data: StockFilterOption[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasFilters: boolean;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (stockFilter: StockFilterOption) => void;
  onDelete: (stockFilter: StockFilterOption) => void;
};

const COLUMN_COUNT = 2;

export function StockFiltersTable({
  data,
  isLoading,
  isError,
  errorMessage,
  hasFilters,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: StockFiltersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => getStockFilterColumns({ onEdit, onDelete }), [onDelete, onEdit]);

  const table = useTable({
    features: billBooksTableFeatures,
    data,
    columns,
    getRowId: (row) => row._id,
    onSortingChange: setSorting,
    state: { sorting },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const isName = header.column.id === 'name';
                const isActions = header.column.id === 'actions';

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-10 px-3 text-muted-foreground',
                      isName && 'sticky left-0 z-20 min-w-44 bg-muted/95',
                      isActions && 'w-16 text-right',
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
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                {Array.from({ length: COLUMN_COUNT }).map((_, columnIndex) => (
                  <TableCell
                    key={columnIndex}
                    className={cn(
                      'px-3 py-2.5',
                      columnIndex === 0 && 'sticky left-0 z-10 bg-background',
                    )}
                  >
                    <Skeleton className="h-5 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_COUNT} className="p-0">
                <Empty className="rounded-none border-0 py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <AlertCircle className="text-destructive" />
                    </EmptyMedia>
                    <EmptyTitle>Could not load stock filters</EmptyTitle>
                    <EmptyDescription>
                      {errorMessage ?? 'Something went wrong while fetching stock filters.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" variant="outline" onClick={onRetry}>
                      Try again
                    </Button>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} className="group">
                {row.getVisibleCells().map((cell) => {
                  const isName = cell.column.id === 'name';
                  const isActions = cell.column.id === 'actions';

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-3 py-2.5',
                        isName &&
                          'sticky left-0 z-10 min-w-0 max-w-64 bg-background group-hover:bg-muted/50',
                        isActions && 'text-right',
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
              <TableCell colSpan={COLUMN_COUNT} className="p-0">
                <Empty className="rounded-none border-0 py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Tags />
                    </EmptyMedia>
                    <EmptyTitle>
                      {hasFilters ? 'No matching stock filters' : 'No stock filters yet'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {hasFilters
                        ? 'Try a different search.'
                        : 'Create a stock filter to group stock on Analytics.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!hasFilters ? (
                    <EmptyContent>
                      <Button type="button" className="h-11 sm:h-10" onClick={onCreate}>
                        <Plus className="size-4" />
                        New stock filter
                      </Button>
                    </EmptyContent>
                  ) : null}
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
