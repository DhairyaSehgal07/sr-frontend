import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  type PaginationState,
  type RowData,
  type Table as TanStackTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
} from 'lucide-react';
import type { ReportColumnMeta, ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { DensityState } from '@/lib/tanstack-table/density-feature';
import { getDensityCellClasses, getDensityHeadClasses } from '@/lib/tanstack-table/density-classes';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const SKELETON_ROW_COUNT = 8;

type PaginationItemValue = number | 'ellipsis';

function getPaginationItems(pageIndex: number, pageCount: number): PaginationItemValue[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const visiblePages = Array.from(
    new Set([0, pageIndex - 1, pageIndex, pageIndex + 1, pageCount - 1]),
  )
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);

  return visiblePages.reduce<PaginationItemValue[]>((items, page) => {
    const previousPage = items[items.length - 1];

    if (typeof previousPage === 'number') {
      if (page - previousPage === 2) {
        items.push(previousPage + 1);
      } else if (page - previousPage > 2) {
        items.push('ellipsis');
      }
    }

    items.push(page);
    return items;
  }, []);
}

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_tfoot_th]:border-t-2 [&_tfoot_th]:border-t-border/60',
  '[&_tfoot_td]:border-t-2 [&_tfoot_td]:border-t-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
  '[&_tfoot_th:last-child]:border-r-0 [&_tfoot_td:last-child]:border-r-0',
);

type ColumnMeta = ReportColumnMeta;

function getColId(
  col: { id?: string; accessorKey?: string | number | symbol },
  index: number,
): string {
  if ('id' in col && col.id) return col.id;
  if ('accessorKey' in col && col.accessorKey) return String(col.accessorKey);
  return `col-${index}`;
}

function getColumnAlign(meta: ColumnMeta | undefined): 'left' | 'right' {
  return meta?.align ?? 'left';
}

function isWrapColumn(meta: ColumnMeta | undefined) {
  return meta?.wrap === true;
}

const REMARKS_COLUMN_WIDTH_CLASS = 'min-w-[14rem] w-[18rem] max-w-[22rem] whitespace-normal';

const REMARKS_BODY_CELL_CLASS = cn(REMARKS_COLUMN_WIDTH_CLASS, 'align-top');

function getGridCellClasses(
  meta: ColumnMeta | undefined,
  variant: 'head' | 'body',
  isHeaderScrolled = false,
) {
  return cn(
    variant === 'head' &&
      (isHeaderScrolled
        ? 'bg-muted/60 text-foreground supports-backdrop-filter:bg-muted/55 backdrop-blur-sm'
        : 'bg-secondary text-secondary-foreground'),
    meta?.groupStart === true &&
      (variant === 'head' ? 'border-l-2 border-l-border/70' : 'border-l-2 border-l-border/55'),
  );
}

function getFooterClassName(
  align: 'left' | 'right',
  density: DensityState,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityCellClasses(density),
    getGridCellClasses(meta, 'body'),
    'bg-muted/60 text-sm transition-[padding,background-color] duration-200 supports-backdrop-filter:bg-muted/55 backdrop-blur-sm',
    isWrapColumn(meta) ? REMARKS_COLUMN_WIDTH_CLASS : 'align-middle',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums',
    meta?.emphasize === true && 'font-semibold',
  );
}

function getHeadClassName(
  align: 'left' | 'right',
  density: DensityState,
  isHeaderScrolled: boolean,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityHeadClasses(density),
    getGridCellClasses(meta, 'head', isHeaderScrolled),
    'transition-[padding,background-color,color] duration-200',
    isWrapColumn(meta) ? REMARKS_COLUMN_WIDTH_CLASS : undefined,
    'align-middle',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums',
    meta?.emphasize === true && 'font-semibold',
  );
}

function getBodyCellClassName(
  columnId: string,
  align: 'left' | 'right',
  isEmpty: boolean,
  density: DensityState,
  meta: ColumnMeta | undefined,
) {
  return cn(
    getDensityCellClasses(density),
    getGridCellClasses(meta, 'body'),
    'text-sm transition-[padding] duration-200',
    isWrapColumn(meta) ? REMARKS_BODY_CELL_CLASS : 'align-middle',
    align === 'right' && 'text-right',
    meta?.numeric === true && !isEmpty && 'tabular-nums font-medium text-foreground',
    meta?.mono === true && !isEmpty && 'font-mono',
    meta?.emphasize === true && !isEmpty && 'text-foreground',
    (columnId === 'from' || columnId === 'to') && 'max-w-[11rem] sm:max-w-[14rem]',
  );
}

function getValueSpanClassName(
  columnId: string,
  align: 'left' | 'right',
  isEmpty: boolean,
  meta: ColumnMeta | undefined,
) {
  if (isEmpty) {
    return 'text-muted-foreground';
  }

  return cn(
    'block min-w-0 text-foreground',
    !isWrapColumn(meta) && 'truncate',
    isWrapColumn(meta) && 'break-words leading-relaxed',
    align === 'right' && 'ml-auto max-w-none',
    columnId === 'from' && 'max-w-[10rem] font-medium sm:max-w-[12rem]',
    columnId === 'to' && 'max-w-[10rem] font-medium sm:max-w-[12rem]',
    meta?.numeric === true && 'tabular-nums',
    meta?.mono === true && 'font-mono text-sm',
    meta?.emphasize === true && 'font-semibold',
  );
}

function formatDisplayValue(value: unknown, meta: ColumnMeta | undefined): string {
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value);
  if (value == null || value === '') return 'Blank';
  return String(value);
}

type ColumnClassEntry = {
  head: string;
  cell: (isEmpty: boolean) => string;
  span: string;
  footer: string;
};

interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<ReportFeatures, TData, TValue>[];
  table: TanStackTable<ReportFeatures, TData>;
  isLoading?: boolean;
  paginationState?: PaginationState;
  totalRowCount?: number;
}

export function DataTable<TData extends RowData, TValue>({
  columns,
  table,
  isLoading = false,
  paginationState,
  totalRowCount: totalRowCountProp,
}: DataTableProps<TData, TValue>) {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterElevated, setIsFooterElevated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const density = table.store.state.density;

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsHeaderScrolled(el.scrollTop > 0);
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setIsFooterElevated(!atBottom);
  }, []);

  const rows = table.getRowModel().rows;
  const rowCount = rows.length;
  const totalRowCount = totalRowCountProp ?? table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = paginationState ?? table.store.state.pagination;
  const pageCount = Math.max(Math.ceil(totalRowCount / pageSize), 1);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const pageItems = useMemo(() => getPaginationItems(pageIndex, pageCount), [pageCount, pageIndex]);
  const rangeStart = totalRowCount === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRowCount);
  const rangeEnd = totalRowCount === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRowCount);
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);
  const hasDataRows = !isLoading && rowCount > 0;

  const columnClassMap = useMemo(() => {
    const map = new Map<string, ColumnClassEntry>();

    columns.forEach((col, index) => {
      const columnId = getColId(col, index);
      const meta = col.meta;
      const align = getColumnAlign(meta);

      map.set(columnId, {
        head: getHeadClassName(align, density, isHeaderScrolled, meta),
        cell: (isEmpty) => getBodyCellClassName(columnId, align, isEmpty, density, meta),
        span: getValueSpanClassName(columnId, align, false, meta),
        footer: getFooterClassName(align, density, meta),
      });
    });

    return map;
  }, [columns, density, isHeaderScrolled]);

  useEffect(() => {
    handleTableScroll();
  }, [rowCount, isLoading, handleTableScroll]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollLeft, top: 0 });
  }, [pageIndex]);

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
              isHeaderScrolled && 'shadow-[0_1px_0_0] shadow-border/80',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {visibleColumns.map((column) => {
                  const header = headerGroup.headers.find((item) => item.column.id === column.id);
                  if (!header) return null;

                  const columnId = header.column.id;
                  const sorted = header.column.getIsSorted();
                  const columnClasses = columnClassMap.get(columnId);

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className={cn('group/head', columnClasses?.head)}
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
          <TableBody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="border-0 even:bg-muted/15">
                  {visibleColumns.map((column) => {
                    const columnId = column.id;
                    const meta = column.columnDef.meta;
                    const align = getColumnAlign(meta);
                    const columnClasses = columnClassMap.get(columnId);
                    const isHeaderNumeric = meta?.numeric === true || meta?.mono === true;

                    return (
                      <TableCell
                        key={`skeleton-${rowIndex}-${columnId}`}
                        className={columnClasses?.cell(true)}
                      >
                        <Skeleton
                          className={cn(
                            'rounded-md',
                            isWrapColumn(meta) && 'h-12 w-full',
                            !isWrapColumn(meta) &&
                              (align === 'right' || isHeaderNumeric
                                ? 'ml-auto h-5 w-16'
                                : 'h-5 w-full max-w-36'),
                          )}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : rowCount ? (
              rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'border-0 even:bg-muted/20',
                      isGroupedRow &&
                        'bg-primary/5 even:bg-primary/5 hover:bg-primary/10 [&>td]:border-b-border/60 [&>td]:border-t-border/60 [&>td]:shadow-[inset_0_1px_0_hsl(var(--primary)/0.12)]',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnId = cell.column.id;
                      const meta = cell.column.columnDef.meta;
                      const isStatusColumn = columnId === 'status';
                      const value = cell.getValue();
                      const isEmpty = value == null || value === '';
                      const display = isEmpty ? '—' : String(value);
                      const columnClasses = columnClassMap.get(columnId);
                      const isGroupedCell = cell.getIsGrouped();
                      const isAggregatedCell = cell.getIsAggregated();
                      const isPlaceholderCell = cell.getIsPlaceholder();

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            columnClasses?.cell(isEmpty),
                            isGroupedRow && 'bg-transparent',
                          )}
                        >
                          {isGroupedCell ? (
                            <button
                              type="button"
                              className="flex min-w-0 items-center gap-2 rounded-md text-left text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                              style={{ paddingLeft: `${row.depth * 0.75}rem` }}
                              onClick={row.getToggleExpandedHandler()}
                              aria-expanded={row.getIsExpanded()}
                            >
                              {row.getCanExpand() ? (
                                row.getIsExpanded() ? (
                                  <ChevronDown
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden
                                  />
                                ) : (
                                  <ChevronRight
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden
                                  />
                                )
                              ) : null}
                              <span className="min-w-0 truncate">
                                {formatDisplayValue(value, meta)}
                              </span>
                              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                                {row.subRows.length.toLocaleString('en-IN')}
                              </span>
                            </button>
                          ) : isAggregatedCell ? (
                            meta?.numeric === true ? (
                              <span className="font-semibold text-foreground">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                            ) : (
                              <span aria-hidden />
                            )
                          ) : isPlaceholderCell ? null : isStatusColumn ? (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          ) : isEmpty ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={columnClasses?.span}
                              title={isWrapColumn(meta) ? undefined : display}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={columnCount} className="border-0 p-0 last:border-r-0">
                  <Empty className="rounded-none border-0 bg-muted/20 py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>No transfer stock records in this range</EmptyTitle>
                      <EmptyDescription>
                        Adjust the date filters above or reset to load the full report.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {hasDataRows ? (
            <TableFooter
              className={cn(
                'sticky bottom-0 z-10 border-0 bg-transparent [&>tr]:border-0',
                isFooterElevated && 'shadow-[0_-1px_0_0] shadow-border/80',
              )}
            >
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id} className="border-0 hover:bg-transparent">
                  {visibleColumns.map((column, headerIndex) => {
                    const header = footerGroup.headers.find((item) => item.column.id === column.id);
                    if (!header) return null;

                    const columnId = header.column.id;
                    const meta = header.column.columnDef.meta;
                    const columnClasses = columnClassMap.get(columnId);
                    const footerContent = header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext());

                    if (headerIndex === 0) {
                      return (
                        <TableHead key={header.id} scope="row" className={columnClasses?.footer}>
                          {footerContent}
                        </TableHead>
                      );
                    }

                    return (
                      <TableCell
                        key={header.id}
                        className={columnClasses?.footer}
                        aria-label={meta?.numeric === true ? 'column total' : undefined}
                      >
                        {footerContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          ) : null}
        </Table>
      </div>
      {hasDataRows ? (
        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium tabular-nums text-foreground">
              {rangeStart.toLocaleString('en-IN')}–{rangeEnd.toLocaleString('en-IN')}
            </span>{' '}
            of{' '}
            <span className="font-medium tabular-nums text-foreground">
              {totalRowCount.toLocaleString('en-IN')}
            </span>{' '}
            visible rows
            <span className="hidden sm:inline"> · {pageSize.toLocaleString('en-IN')} per page</span>
          </p>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent className="flex-wrap justify-start sm:justify-end">
              <PaginationItem className="hidden sm:list-item">
                <PaginationLink
                  href="#"
                  aria-label="Go to first page"
                  aria-disabled={!canPreviousPage}
                  tabIndex={canPreviousPage ? undefined : -1}
                  className={cn('size-9', !canPreviousPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <ChevronsLeft className="size-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Prev"
                  aria-disabled={!canPreviousPage}
                  tabIndex={canPreviousPage ? undefined : -1}
                  className={cn(!canPreviousPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: Math.max(current.pageIndex - 1, 0),
                    }));
                  }}
                />
              </PaginationItem>
              {pageItems.map((item, itemIndex) =>
                typeof item === 'number' ? (
                  <PaginationItem
                    key={`transfer-stock-report-page-${item}`}
                    className="hidden sm:list-item"
                  >
                    <PaginationLink
                      href="#"
                      isActive={item === pageIndex}
                      onClick={(event) => {
                        event.preventDefault();
                        table.setPagination((current) => ({
                          ...current,
                          pageIndex: item,
                        }));
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem
                    key={`transfer-stock-report-${item}-${itemIndex}`}
                    className="hidden sm:list-item"
                  >
                    <PaginationEllipsis />
                  </PaginationItem>
                ),
              )}
              <PaginationItem className="sm:hidden">
                <span
                  className="flex h-10 min-w-16 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums text-foreground"
                  aria-live="polite"
                >
                  {pageIndex + 1} / {pageCount}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!canNextPage}
                  tabIndex={canNextPage ? undefined : -1}
                  className={cn(!canNextPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: Math.min(current.pageIndex + 1, pageCount - 1),
                    }));
                  }}
                />
              </PaginationItem>
              <PaginationItem className="hidden sm:list-item">
                <PaginationLink
                  href="#"
                  aria-label="Go to last page"
                  aria-disabled={!canNextPage}
                  tabIndex={canNextPage ? undefined : -1}
                  className={cn('size-9', !canNextPage && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPagination((current) => ({
                      ...current,
                      pageIndex: pageCount - 1,
                    }));
                  }}
                >
                  <ChevronsRight className="size-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
