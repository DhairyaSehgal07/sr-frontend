import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
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

import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { type DensityState } from '@/lib/tanstack-table/density-feature';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { useShedBifurcations } from './api/use-shed-bifurcations';
import type { ShedBifurcationParams, ShedBifurcationRow } from './api/types';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import { shedBifurcationReportTableFeatures } from './table-features';
import {
  advancedReportGlobalFilterFn,
  type AdvancedReportGlobalFilter,
  selectedValuesFilterFn,
} from './utils/report-filter-fns';
import { formatIndianIntegerTotal, sumReportNumericColumn } from './utils/report-formatters';
import {
  getShedBifurcationReportColumnIds,
  getStoredShedBifurcationReportColumnState,
} from './utils/report-column-preferences';
import {
  openShedBifurcationReportPreview,
  SHED_BIFURCATION_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE,
  SHED_BIFURCATION_REPORT_DOWNLOAD_EXCEL_MESSAGE,
} from './utils/preview-shed-bifurcations-report-html';

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const SHED_BIFURCATION_REPORT_COLUMN_IDS = getShedBifurcationReportColumnIds(
  columns as ColumnDef<ReportFeatures, Record<string, unknown>>[],
);

export function ShedBifurcationsReportPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [appliedParams, setAppliedParams] = useState<ShedBifurcationParams>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () =>
      getStoredShedBifurcationReportColumnState(SHED_BIFURCATION_REPORT_COLUMN_IDS)
        .columnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () => getStoredShedBifurcationReportColumnState(SHED_BIFURCATION_REPORT_COLUMN_IDS).columnOrder,
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
  const { data, error, isFetching, isLoading, refetch } = useShedBifurcations(appliedParams);

  const reportRows = useMemo(() => data ?? [], [data]);
  const table = useTable<ReportFeatures, ShedBifurcationRow>({
    features: shedBifurcationReportTableFeatures,
    data: reportRows,
    columns,
    defaultColumn: {
      filterFn: selectedValuesFilterFn,
    },
    globalFilterFn: advancedReportGlobalFilterFn,
    getRowId: (row) => row.id || `${row.gatePassNo}-${row.createdAt}`,
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
  const quantityTotal = useMemo(
    () => sumReportNumericColumn(filteredRows, 'lineQuantity'),
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
    const next: ShedBifurcationParams = {};
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
      { type: SHED_BIFURCATION_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE },
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
      const { exportShedBifurcationReportToExcel } = await import(
        './utils/export-shed-bifurcations-report-excel'
      );
      await exportShedBifurcationReportToExcel({
        table,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Shed Bifurcations',
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
      if (event.data?.type !== SHED_BIFURCATION_REPORT_DOWNLOAD_EXCEL_MESSAGE) return;

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
      previewWindowRef.current = openShedBifurcationReportPreview({
        table,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Shed Bifurcations',
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
              Shed Bifurcations
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                'Loading report…'
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">
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

      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <p className="text-sm text-muted-foreground">Total quantity</p>
        <p className="text-xl font-semibold text-foreground tabular-nums">
          {isLoading ? 'Loading...' : formatIndianIntegerTotal(quantityTotal)}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        table={table}
        isLoading={isLoading}
        paginationState={pagination}
        totalRowCount={rowCount}
      />
    </div>
  );
}
