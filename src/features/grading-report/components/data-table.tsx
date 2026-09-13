import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type SortDirection,
  type SortingState,
  type Table as TanStackTable,
  type ColumnVisibilityState,
  flexRender,
  useTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
} from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import { getGradingReportFooterContent } from '@/features/grading-report/components/report-totals-footer';
import {
  advancedReportGlobalFilterFn,
  selectedValuesFilterFn,
  type AdvancedReportGlobalFilter,
} from '@/features/grading-report/utils/report-filter-fns';
import {
  getGradingReportColumnIds,
  getStoredGradingReportColumnState,
} from '@/features/grading-report/utils/report-column-preferences';
import { gradingReportTableFeatures } from '@/features/grading-report/table-features';
import type { ReportColumnMeta, ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import { cn } from '@/lib/utils';

const INCOMING_GATE_PASS_COLUMN_IDS = new Set([
  'incomingManualGatePassNumber',
  'incomingBagsReceived',
  'incomingStage',
  'incomingCategory',
  'incomingGatePassNetWeightKg',
]);
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
  '[&_th]:border-border/60 [&_td]:border-border/45',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/75',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type ColumnMeta = ReportColumnMeta;

interface DataTableProps {
  columns: ColumnDef<ReportFeatures, GradingGatePassReportRow>[];
  data: GradingGatePassReportRow[];
  isLoading?: boolean;
  onTableReady?: (table: TanStackTable<ReportFeatures, GradingGatePassReportRow>) => void;
}

type IncomingGatePassRow =
  | string
  | {
      _id?: string;
      manualGatePassNumber?: number | string;
      bagsReceived?: number | string;
      stage?: string;
      category?: string;
      netWeightKg?: number | string;
    };

function SortIcon({ sorted }: { sorted: false | SortDirection }) {
  if (sorted === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />;
  }

  if (sorted === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />;
  }

  return <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />;
}

function getIncomingGatePasses(row: unknown): IncomingGatePassRow[] {
  if (typeof row !== 'object' || row === null || !('incomingGatePassIds' in row)) {
    return [];
  }

  const value = (row as { incomingGatePassIds?: unknown }).incomingGatePassIds;

  return Array.isArray(value) ? (value as IncomingGatePassRow[]) : [];
}

function formatIndianNumber(value: unknown, maximumFractionDigits = 3) {
  if (value == null || value === '') return '-';

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);

  return parsed.toLocaleString('en-IN', { maximumFractionDigits });
}

function getIncomingGatePassValue(gatePass: IncomingGatePassRow | undefined, columnId: string) {
  if (!gatePass) return '-';

  if (typeof gatePass === 'string') {
    return '-';
  }

  switch (columnId) {
    case 'incomingManualGatePassNumber':
      return gatePass.manualGatePassNumber ?? '-';
    case 'incomingBagsReceived':
      return formatIndianNumber(gatePass.bagsReceived, 0);
    case 'incomingStage':
      return gatePass.stage ?? '-';
    case 'incomingCategory':
      return gatePass.category ?? '-';
    case 'incomingGatePassNetWeightKg':
      return formatIndianNumber(gatePass.netWeightKg);
    default:
      return '-';
  }
}

function getColumnAlign(meta: ColumnMeta | undefined): 'left' | 'right' {
  return meta?.align ?? 'left';
}

function formatDisplayValue(value: unknown, meta: ColumnMeta | undefined) {
  if (value == null || value === '') return 'Blank';

  return meta?.filterValueFormatter?.(value) ?? String(value);
}

function isWrapColumn(meta: ColumnMeta | undefined) {
  return meta?.wrap === true;
}

function getHeadClassName(meta: ColumnMeta | undefined, isHeaderScrolled: boolean) {
  const align = getColumnAlign(meta);

  return cn(
    'h-11 px-3 align-middle transition-[background-color,color,padding] duration-200',
    isHeaderScrolled
      ? 'bg-muted/60 text-foreground supports-backdrop-filter:bg-muted/55 backdrop-blur-sm'
      : 'bg-secondary text-secondary-foreground',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums',
    meta?.groupStart === true && 'border-l-2 border-l-border/80',
    isWrapColumn(meta) && 'min-w-[14rem] whitespace-normal',
  );
}

function getBodyCellClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'px-3 py-3 align-middle text-sm text-foreground transition-colors',
    align === 'right' && 'text-right',
    meta?.numeric === true && 'tabular-nums font-medium',
    meta?.mono === true && 'font-mono',
    meta?.emphasize === true && 'font-semibold',
    meta?.groupStart === true && 'border-l-2 border-l-border/65',
    isWrapColumn(meta)
      ? 'min-w-[14rem] max-w-[22rem] whitespace-normal break-words leading-relaxed'
      : 'whitespace-nowrap',
  );
}

function getSkeletonClassName(meta: ColumnMeta | undefined) {
  const align = getColumnAlign(meta);

  return cn(
    'h-5 rounded-md',
    isWrapColumn(meta) ? 'h-12 w-full' : 'w-full max-w-36',
    (align === 'right' || meta?.numeric === true || meta?.mono === true) &&
      !isWrapColumn(meta) &&
      'ml-auto w-16',
  );
}

function getFooterClassName(meta: ColumnMeta | undefined) {
  return cn(
    getBodyCellClassName(meta),
    'bg-muted/60 font-semibold supports-backdrop-filter:bg-muted/55 backdrop-blur-sm',
  );
}

export function DataTable({ columns, data, isLoading = false, onTableReady }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [globalFilter, setGlobalFilter] = useState<AdvancedReportGlobalFilter>({
    logic: 'AND',
    conditions: [],
    manualGatePassSearch: '',
  });
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() => {
    const columnIds = getGradingReportColumnIds(
      columns as ColumnDef<ReportFeatures, Record<string, unknown>>[],
    );
    return getStoredGradingReportColumnState(columnIds).columnVisibility;
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const columnIds = getGradingReportColumnIds(
      columns as ColumnDef<ReportFeatures, Record<string, unknown>>[],
    );
    return getStoredGradingReportColumnState(columnIds).columnOrder;
  });
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterElevated, setIsFooterElevated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const table = useTable<ReportFeatures, GradingGatePassReportRow>({
    features: gradingReportTableFeatures,
    data,
    columns,
    defaultColumn: {
      filterFn: selectedValuesFilterFn,
    },
    globalFilterFn: advancedReportGlobalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    sortDescFirst: false,
    enableSortingRemoval: true,
    autoResetPageIndex: false,
    pageCount: Math.max(1, Math.ceil(data.length / pagination.pageSize)),
    paginateExpandedRows: false,
  });
  const rows = table.getRowModel().rows;
  const footerRows = table.getFilteredRowModel().rows;
  const totalRowCount = footerRows.length;
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(Math.ceil(totalRowCount / pageSize), 1);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const pageItems = useMemo(() => getPaginationItems(pageIndex, pageCount), [pageCount, pageIndex]);
  const rangeStart = totalRowCount === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRowCount);
  const rangeEnd = totalRowCount === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRowCount);
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = Math.max(visibleColumns.length, 1);
  const hasDataRows = !isLoading && rows.length > 0;
  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsHeaderScrolled(el.scrollTop > 0);
    setIsFooterElevated(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, isLoading, rows.length]);

  useEffect(() => {
    if (pagination.pageIndex < pageCount) return;

    setPagination((current) => ({
      ...current,
      pageIndex: Math.max(pageCount - 1, 0),
    }));
  }, [pageCount, pagination.pageIndex]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({ left: el.scrollLeft, top: 0 });
  }, [pageIndex]);

  useEffect(() => {
    onTableReady?.(table);
  }, [onTableReady, table]);

  return (
    <div className="border-border bg-card text-card-foreground flex w-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-sm">
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
              isHeaderScrolled && 'shadow-border/80 shadow-[0_1px_0_0]',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort() && header.subHeaders.length === 0;
                  const align = getColumnAlign(meta);
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className={cn(
                        'group/head',
                        getHeadClassName(meta, isHeaderScrolled),
                        header.subHeaders.length > 0 &&
                          'h-10 text-center [&>span]:items-center [&>span>span:first-child]:text-xs [&>span>span:first-child]:font-semibold [&>span>span:first-child]:tracking-[0.08em] [&>span>span:first-child]:uppercase',
                        header.subHeaders.length === 0 && '[&>span>span:first-child]:font-semibold',
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          className={cn(
                            'hover:text-foreground focus-visible:ring-ring/30 flex w-full min-w-0 items-center gap-1.5 rounded-md text-inherit transition-colors focus-visible:ring-2 focus-visible:outline-none',
                            align === 'right'
                              ? 'justify-end text-right'
                              : 'justify-between text-left',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {headerContent}
                          <span
                            className={cn(
                              'text-muted-foreground shrink-0 transition-opacity',
                              sorted ? 'opacity-100' : 'opacity-0 group-hover/head:opacity-70',
                            )}
                          >
                            <SortIcon sorted={sorted} />
                          </span>
                        </button>
                      ) : (
                        headerContent
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="even:bg-muted/15 border-0">
                  {visibleColumns.map((column) => {
                    const meta = column.columnDef.meta;

                    return (
                      <TableCell
                        key={`skeleton-${rowIndex}-${column.id}`}
                        className={getBodyCellClassName(meta)}
                      >
                        <Skeleton className={getSkeletonClassName(meta)} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();
                if (isGroupedRow) {
                  return (
                    <TableRow
                      key={row.id}
                      className="bg-primary/5 hover:bg-primary/10 [&>td]:border-b-border/60 [&>td]:border-t-border/60 even:bg-primary/5 border-0 [&>td]:shadow-[inset_0_1px_0_hsl(var(--primary)/0.12)]"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta;
                        const value = cell.getValue();
                        const isGroupedCell = cell.getIsGrouped();
                        const isAggregatedCell = cell.getIsAggregated();
                        const isPlaceholderCell = cell.getIsPlaceholder();

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(getBodyCellClassName(meta), 'bg-transparent')}
                          >
                            {isGroupedCell ? (
                              <button
                                type="button"
                                className="text-foreground hover:text-primary focus-visible:ring-ring/30 flex min-w-0 items-center gap-2 rounded-md text-left text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                style={{ paddingLeft: `${row.depth * 0.75}rem` }}
                                onClick={row.getToggleExpandedHandler()}
                                aria-expanded={row.getIsExpanded()}
                              >
                                {row.getCanExpand() ? (
                                  row.getIsExpanded() ? (
                                    <ChevronDown
                                      className="text-primary size-4 shrink-0"
                                      aria-hidden
                                    />
                                  ) : (
                                    <ChevronRight
                                      className="text-primary size-4 shrink-0"
                                      aria-hidden
                                    />
                                  )
                                ) : null}
                                <span className="min-w-0 truncate">
                                  {formatDisplayValue(value, meta)}
                                </span>
                                <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                                  {row.subRows.length.toLocaleString('en-IN')}
                                </span>
                              </button>
                            ) : isAggregatedCell ? (
                              meta?.numeric === true ? (
                                <span className="text-foreground font-semibold">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </span>
                              ) : (
                                <span aria-hidden />
                              )
                            ) : isPlaceholderCell ? null : (
                              <span aria-hidden />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }

                const incomingGatePasses = getIncomingGatePasses(row.original);
                const rowSpan = Math.max(incomingGatePasses.length, 1);
                const groupBackground = row.index % 2 === 1 ? 'bg-muted/15' : 'bg-card';
                const groupBoundary =
                  row.index > 0 ? '[&>td]:border-t-2 [&>td]:border-t-border/70' : undefined;

                return (
                  <Fragment key={row.id}>
                    {Array.from({ length: rowSpan }).map((_, incomingIndex) => (
                      <TableRow
                        key={`${row.id}-${incomingIndex}`}
                        className={cn(
                          'hover:bg-muted/30 border-0',
                          groupBackground,
                          incomingIndex === 0 && groupBoundary,
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta;

                          if (INCOMING_GATE_PASS_COLUMN_IDS.has(cell.column.id)) {
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(getBodyCellClassName(meta), 'bg-muted/25 align-top')}
                              >
                                <span
                                  className={cn(
                                    'border-border/60 bg-background/80 text-foreground inline-flex max-w-full rounded-md border px-2 py-1 shadow-sm',
                                    getColumnAlign(meta) === 'right' && 'ml-auto justify-end',
                                  )}
                                >
                                  {getIncomingGatePassValue(
                                    incomingGatePasses[incomingIndex],
                                    cell.column.id,
                                  )}
                                </span>
                              </TableCell>
                            );
                          }

                          if (incomingIndex > 0) return null;

                          return (
                            <TableCell
                              key={cell.id}
                              rowSpan={rowSpan}
                              className={cn(
                                getBodyCellClassName(meta),
                                'align-top',
                                groupBackground,
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={columnCount} className="border-0 p-0 last:border-r-0">
                  <Empty className="bg-muted/20 rounded-none border-0 py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>No grading entries found</EmptyTitle>
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
                isFooterElevated && 'shadow-border/80 shadow-[0_-1px_0_0]',
              )}
            >
              <TableRow className="border-0 hover:bg-transparent">
                {visibleColumns.map((column, columnIndex) => {
                  const meta = column.columnDef.meta;
                  const footerContent =
                    columnIndex === 0 ? (
                      <span className="text-foreground text-sm font-semibold">Total</span>
                    ) : (
                      getGradingReportFooterContent(column.id, footerRows)
                    );

                  if (columnIndex === 0) {
                    return (
                      <TableHead
                        key={`footer-${column.id}`}
                        scope="row"
                        className={getFooterClassName(meta)}
                      >
                        {footerContent}
                      </TableHead>
                    );
                  }

                  return (
                    <TableCell
                      key={`footer-${column.id}`}
                      className={getFooterClassName(meta)}
                      aria-label={footerContent ? 'column total' : undefined}
                    >
                      {footerContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
      {hasDataRows ? (
        <div className="border-border/60 bg-muted/20 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-muted-foreground text-sm">
            Showing{' '}
            <span className="text-foreground font-medium tabular-nums">
              {rangeStart.toLocaleString('en-IN')}–{rangeEnd.toLocaleString('en-IN')}
            </span>{' '}
            of{' '}
            <span className="text-foreground font-medium tabular-nums">
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
                    key={`grading-report-page-${item}`}
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
                    key={`grading-report-${item}-${itemIndex}`}
                    className="hidden sm:list-item"
                  >
                    <PaginationEllipsis />
                  </PaginationItem>
                ),
              )}
              <PaginationItem className="sm:hidden">
                <span
                  className="text-foreground flex h-10 min-w-16 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums"
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
