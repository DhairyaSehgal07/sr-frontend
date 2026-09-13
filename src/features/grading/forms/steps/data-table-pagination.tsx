import { type PaginationState, type RowData, type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { GradingFormTableFeatures } from './table-features';

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<GradingFormTableFeatures, TData>;
  pagination: PaginationState;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50] as const;

export function DataTablePagination<TData extends RowData>({
  table,
  pagination,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = pagination;
  const filteredTotal = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const rangeStart = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = filteredTotal === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, filteredTotal);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-3 text-sm text-muted-foreground tabular-nums sm:block sm:space-y-0.5 sm:justify-start">
        <p className="min-w-0 truncate">
          Showing{' '}
          <span className="font-medium text-foreground">
            {rangeStart.toLocaleString('en-IN')}–{rangeEnd.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="font-medium text-foreground">
            {filteredTotal.toLocaleString('en-IN')}
          </span>
        </p>
        <p className="shrink-0">
          <span className="font-medium text-foreground">
            {selectedCount.toLocaleString('en-IN')}
          </span>{' '}
          selected
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <label
            htmlFor="data-table-page-size"
            className="text-xs text-muted-foreground sm:text-sm sm:font-medium sm:text-foreground"
          >
            <span className="sm:hidden">Per page</span>
            <span className="hidden sm:inline">Rows per page</span>
          </label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id="data-table-page-size"
              className="h-10 w-17 sm:h-9"
              aria-label="Rows per page"
            >
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <p className="hidden min-w-28 justify-center text-sm font-medium tabular-nums text-foreground sm:flex">
            Page {pageIndex + 1} of {pageCount}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-9 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-10 shrink-0 sm:size-9"
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <span
            className="min-w-13 px-1 text-center text-sm font-medium tabular-nums text-foreground sm:hidden"
            aria-live="polite"
          >
            {pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-10 shrink-0 sm:size-9"
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-9 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
