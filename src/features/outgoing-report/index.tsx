import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type ExpandedState,
  functionalUpdate,
  type GroupingState,
  type PaginationState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { type DensityState } from '@/lib/tanstack-table/density-feature';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import type { OutgoingReportParams, OutgoingReportRow } from './api/types';
import { useOutgoingGatePassReport } from './api/use-outgoing-gate-pass-report';
import { getOutgoingReportColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import { outgoingReportTableFeatures } from './table-features';
import {
  OUTGOING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE,
  OUTGOING_REPORT_DOWNLOAD_EXCEL_MESSAGE,
  openOutgoingReportPreview,
} from './utils/preview-outgoing-report-html';
import {
  getOutgoingReportColumnIds,
  getStoredOutgoingReportColumnState,
} from './utils/report-column-preferences';
import {
  type AdvancedReportGlobalFilter,
  advancedReportGlobalFilterFn,
  selectedValuesFilterFn,
} from './utils/report-filter-fns';
import {
  formatIndianIntegerTotal,
  formatIndianWeightTotal,
  sumReportNumericColumn,
} from './utils/report-formatters';

function mergeColumnOrder(current: ColumnOrderState, columnIds: string[]): ColumnOrderState {
  if (current.length === 0) return [];

  const idSet = new Set(columnIds);
  const kept = current.filter((columnId) => idSet.has(columnId));
  const missing = columnIds.filter((columnId) => !kept.includes(columnId));
  if (missing.length === 0) return kept;

  const lastSizeIndex = kept.findLastIndex(
    (columnId) => columnId.startsWith('size-') || columnId === 'totalBags',
  );
  const insertAt = lastSizeIndex >= 0 ? lastSizeIndex + 1 : kept.length;

  return [...kept.slice(0, insertAt), ...missing, ...kept.slice(insertAt)];
}

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const OutgoingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [appliedParams, setAppliedParams] = useState<OutgoingReportParams>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () =>
      getStoredOutgoingReportColumnState(
        getOutgoingReportColumnIds(
          getOutgoingReportColumns([]) as ColumnDef<ReportFeatures, Record<string, unknown>>[],
        ),
      ).columnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () =>
      getStoredOutgoingReportColumnState(
        getOutgoingReportColumnIds(
          getOutgoingReportColumns([]) as ColumnDef<ReportFeatures, Record<string, unknown>>[],
        ),
      ).columnOrder,
  );
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
  const [density, setDensity] = useState<DensityState>('lg');
  const [isExporting, setIsExporting] = useState(false);
  const previewWindowRef = useRef<Window | null>(null);

  const coldStorageName = useAuthStore((s) => s.user?.coldStorageId.name);
  const { data, error, isFetching, isLoading, refetch } = useOutgoingGatePassReport(appliedParams);

  const reportRows = useMemo(() => data?.outgoingGatePasses ?? [], [data?.outgoingGatePasses]);
  const tableColumns = useMemo(() => getOutgoingReportColumns(reportRows), [reportRows]);
  const columnIds = useMemo(
    () =>
      getOutgoingReportColumnIds(
        tableColumns as ColumnDef<ReportFeatures, Record<string, unknown>>[],
      ),
    [tableColumns],
  );
  const columnIdsKey = columnIds.join('|');

  useEffect(() => {
    const nextIds = columnIdsKey.length > 0 ? columnIdsKey.split('|') : [];
    const idSet = new Set(nextIds);

    setColumnVisibility((current) => {
      const next: ColumnVisibilityState = {};
      for (const [columnId, visible] of Object.entries(current)) {
        if (idSet.has(columnId) && visible === false) next[columnId] = false;
      }
      return next;
    });
    setColumnOrder((current) => mergeColumnOrder(current, nextIds));
  }, [columnIdsKey]);

  const table = useTable<ReportFeatures, OutgoingReportRow>({
    features: outgoingReportTableFeatures,
    data: reportRows,
    columns: tableColumns,
    defaultColumn: {
      filterFn: selectedValuesFilterFn,
    },
    globalFilterFn: advancedReportGlobalFilterFn,
    getRowId: (row) => row._id,
    enableSortingRemoval: true,
    autoResetPageIndex: false,
    pageCount: Math.max(1, Math.ceil(reportRows.length / pagination.pageSize)),
    paginateExpandedRows: false,
    state: {
      density,
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      pagination,
      globalFilter,
    },
    onDensityChange: (updater) => {
      setDensity((previous) => functionalUpdate(updater, previous));
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });
  const filteredRows = table.getFilteredRowModel().rows;
  const rowCount = filteredRows.length;
  const reportTotals = useMemo(
    () => ({
      totalBags: sumReportNumericColumn(filteredRows, 'totalBags'),
      totalNetWeight: sumReportNumericColumn(filteredRows, 'netWeightKg'),
    }),
    [filteredRows],
  );

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(rowCount / pagination.pageSize));
    if (pagination.pageIndex < pageCount) return;

    setPagination((current) => ({
      ...current,
      pageIndex: Math.max(pageCount - 1, 0),
    }));
  }, [pagination.pageIndex, pagination.pageSize, rowCount]);

  const handleApply = () => {
    const next: OutgoingReportParams = {};
    const dateFrom = toReportDateParam(fromDate);
    const dateTo = toReportDateParam(toDate);
    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;
    setAppliedParams(next);
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedParams({});
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setGlobalFilter((current) => ({
      ...current,
      manualGatePassSearch: value,
    }));
  };

  const notifyPreviewDownloadComplete = useCallback(() => {
    const previewWindow = previewWindowRef.current;
    if (!previewWindow || previewWindow.closed) return;

    previewWindow.postMessage(
      { type: OUTGOING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE },
      window.location.origin,
    );
  }, []);

  const handleExportExcel = useCallback(async () => {
    if (rowCount === 0) {
      toast.error('No rows to export. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsExporting(true);

    try {
      const { exportOutgoingReportToExcel } = await import('./utils/export-outgoing-report-excel');
      await exportOutgoingReportToExcel({
        table,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Outgoing Gate Passes',
        fromDate,
        toDate,
      });
      toast.success('Report exported to Excel', {
        position: 'bottom-right',
      });
    } catch (exportError) {
      toast.error(
        exportError instanceof Error ? exportError.message : 'Failed to export report to Excel',
        { position: 'bottom-right' },
      );
    } finally {
      setIsExporting(false);
      notifyPreviewDownloadComplete();
    }
  }, [coldStorageName, fromDate, notifyPreviewDownloadComplete, rowCount, table, toDate]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== OUTGOING_REPORT_DOWNLOAD_EXCEL_MESSAGE) return;

      void handleExportExcel();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleExportExcel]);

  const handlePreview = useCallback(() => {
    if (rowCount === 0) {
      toast.error('No rows to preview. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      previewWindowRef.current = openOutgoingReportPreview({
        table,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Outgoing Gate Passes',
        fromDate,
        toDate,
      });
    } catch (previewError) {
      toast.error(
        previewError instanceof Error ? previewError.message : 'Failed to open report preview',
        { position: 'bottom-right' },
      );
    }
  }, [coldStorageName, fromDate, rowCount, table, toDate]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Outgoing gate passes
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                'Loading report…'
              ) : (
                <>
                  <span className="tabular-nums font-medium text-foreground">
                    {rowCount.toLocaleString('en-IN')}
                  </span>{' '}
                  {rowCount === 1 ? 'entry' : 'entries'}
                </>
              )}
            </p>
          </div>
        </div>

        <ReportToolbar
          table={table}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={() => {
            void refetch();
          }}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
          isRefreshing={isFetching && !isLoading}
          isExporting={isExporting}
          onPreview={handlePreview}
          onExportExcel={handleExportExcel}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground">Total bags</p>
          <p className="tabular-nums text-xl font-semibold text-foreground">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(reportTotals.totalBags)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground">Net weight</p>
          <p className="tabular-nums text-xl font-semibold text-foreground">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.totalNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-sm font-medium text-muted-foreground">kg</span>
            ) : null}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground">Gate passes</p>
          <p className="tabular-nums text-xl font-semibold text-foreground">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(rowCount)}
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable
        columns={tableColumns}
        table={table}
        isLoading={isLoading}
        paginationState={pagination}
        totalRowCount={rowCount}
      />
    </div>
  );
};

export default OutgoingReportPage;
