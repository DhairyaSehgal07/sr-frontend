import { flexRender, type SortingState, useTable } from '@tanstack/react-table';
import { AlertCircle, BookCopy, Plus } from 'lucide-react';
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
import type { BillBook } from '@/features/settings/api/types';
import { cn } from '@/lib/utils';
import { getBillBookColumns } from './bill-book-columns';
import { billBooksTableFeatures } from './table-features';

type BillBooksTableProps = {
  data: BillBook[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasFilters: boolean;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (billBook: BillBook) => void;
  onArchive: (billBook: BillBook) => void;
  onRestore: (billBook: BillBook) => void;
};

const COLUMN_COUNT = 5;

export function BillBooksTable({
  data,
  isLoading,
  isError,
  errorMessage,
  hasFilters,
  onRetry,
  onCreate,
  onEdit,
  onArchive,
  onRestore,
}: BillBooksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => getBillBookColumns({ onEdit, onArchive, onRestore }),
    [onArchive, onEdit, onRestore],
  );

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
      <Table className="min-w-[40rem]">
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
                    <EmptyTitle>Could not load bill books</EmptyTitle>
                    <EmptyDescription>
                      {errorMessage ?? 'Something went wrong while fetching bill books.'}
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
                      <BookCopy />
                    </EmptyMedia>
                    <EmptyTitle>
                      {hasFilters ? 'No matching bill books' : 'No bill books yet'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {hasFilters
                        ? 'Try a different search, or switch the status filter.'
                        : 'Create a bill book to use on gate passes.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!hasFilters ? (
                    <EmptyContent>
                      <Button type="button" className="h-11 sm:h-10" onClick={onCreate}>
                        <Plus className="size-4" />
                        New bill book
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
