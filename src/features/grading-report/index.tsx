import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { Badge } from '@/components/ui/badge';
import {
  useGradingGatePassReport,
  type GradingGatePassReportParams,
} from './api/use-grading-gate-pass-report';
import type { GradingGatePassReportRow } from './api/types';
import { getGradingReportColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { ReportToolbar } from './components/report-toolbar';
import {
  formatIndianIntegerTotal,
  formatIndianPercentageTotal,
  formatIndianWeightTotal,
  getIncomingGatePassObjects,
  parseReportNumber,
} from './utils/report-formatters';
import {
  GRADING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE,
  GRADING_REPORT_DOWNLOAD_EXCEL_MESSAGE,
  openGradingReportPreview,
} from './utils/preview-grading-report-html';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

function toReportDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const DEFAULT_GRADING_REPORT_PARAMS = {} satisfies GradingGatePassReportParams;

function matchesSearch(value: unknown, query: string): boolean {
  return (JSON.stringify(value) ?? '').toLowerCase().includes(query);
}

function average(values: number[]): number {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const GradingReportPage = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTable, setReportTable] = useState<TanStackTable<
    ReportFeatures,
    GradingGatePassReportRow
  > | null>(null);
  const [appliedParams, setAppliedParams] = useState<GradingGatePassReportParams>(
    DEFAULT_GRADING_REPORT_PARAMS,
  );
  const [isExporting, setIsExporting] = useState(false);
  const previewWindowRef = useRef<Window | null>(null);

  const coldStorageName = useAuthStore((s) => s.user?.coldStorageId.name);
  const { data, error, isFetching, isLoading, refetch } = useGradingGatePassReport(appliedParams);

  const displayedResponse = useMemo(() => {
    if (!data) return null;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return {
      ...data,
      data: {
        ...data.data,
        gradingGatePasses: data.data.gradingGatePasses.filter((gatePass) =>
          matchesSearch(gatePass, query),
        ),
      },
    };
  }, [data, searchQuery]);

  const reportRows = useMemo(
    () => displayedResponse?.data.gradingGatePasses ?? [],
    [displayedResponse],
  );
  const tableColumns = useMemo(() => getGradingReportColumns(reportRows), [reportRows]);
  const rowCount = reportRows.length;
  const reportTotals = useMemo(() => {
    const wastageValues: number[] = [];
    const wastagePercentageValues: number[] = [];
    const totals = reportRows.reduce(
      (totals, gatePass) => {
        gatePass.orderDetails.forEach((detail) => {
          totals.gradingBags += detail.quantity;
        });

        getIncomingGatePassObjects(gatePass).forEach((incomingGatePass) => {
          totals.incomingBags += parseReportNumber(incomingGatePass.bagsReceived) ?? 0;
        });

        totals.incomingNetWeight += parseReportNumber(gatePass.incomingNetWeightKg) ?? 0;
        totals.gradingNetWeight += parseReportNumber(gatePass.netWeightKg) ?? 0;

        wastageValues.push(parseReportNumber(gatePass.wastageKg) ?? 0);
        wastagePercentageValues.push(parseReportNumber(gatePass.wastagePercentage) ?? 0);

        return totals;
      },
      {
        incomingBags: 0,
        incomingNetWeight: 0,
        gradingBags: 0,
        gradingNetWeight: 0,
      },
    );

    return {
      ...totals,
      averageWastageKg: average(wastageValues),
      averageWastagePercentage: average(wastagePercentageValues),
    };
  }, [reportRows]);
  const handleTableReady = useCallback(
    (table: TanStackTable<ReportFeatures, GradingGatePassReportRow>) => {
      setReportTable((current) => (current === table ? current : table));
    },
    [],
  );

  const filteredRowCount = reportTable?.getFilteredRowModel().rows.length ?? rowCount;

  const notifyPreviewDownloadComplete = useCallback(() => {
    const previewWindow = previewWindowRef.current;
    if (!previewWindow || previewWindow.closed) return;

    previewWindow.postMessage(
      { type: GRADING_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE },
      window.location.origin,
    );
  }, []);

  const handleExportExcel = useCallback(async () => {
    if (!reportTable) return;

    if (filteredRowCount === 0) {
      toast.error('No rows to export. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsExporting(true);

    try {
      const { exportGradingReportToExcel } = await import('./utils/export-grading-report-excel');
      await exportGradingReportToExcel({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Grading Report',
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
  }, [
    coldStorageName,
    filteredRowCount,
    fromDate,
    notifyPreviewDownloadComplete,
    reportTable,
    toDate,
  ]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GRADING_REPORT_DOWNLOAD_EXCEL_MESSAGE) return;

      void handleExportExcel();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleExportExcel]);

  const handlePreview = useCallback(() => {
    if (!reportTable) return;

    if (filteredRowCount === 0) {
      toast.error('No rows to preview. Adjust filters or load report data.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      previewWindowRef.current = openGradingReportPreview({
        table: reportTable,
        coldStorageName: coldStorageName ?? 'Cold Storage',
        reportTitle: 'Grading Report',
        fromDate,
        toDate,
      });
    } catch (previewError) {
      toast.error(
        previewError instanceof Error ? previewError.message : 'Failed to open report preview',
        { position: 'bottom-right' },
      );
    }
  }, [coldStorageName, filteredRowCount, fromDate, reportTable, toDate]);

  const handleApply = () => {
    const next: GradingGatePassReportParams = {};
    const dateFrom = toReportDateParam(fromDate);
    const dateTo = toReportDateParam(toDate);

    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;

    setAppliedParams(next);
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSearchQuery('');
    setAppliedParams(DEFAULT_GRADING_REPORT_PARAMS);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border/60 bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Grading report
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? (
                  'Loading report...'
                ) : (
                  <>
                    <span className="text-foreground font-medium tabular-nums">
                      {rowCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {rowCount === 1 ? 'grading entry' : 'grading entries'}
                    <span className="hidden sm:inline"> linked to incoming gate passes</span>
                  </>
                )}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="border-border/60 bg-background/80 text-foreground w-fit gap-1.5"
            >
              <span className="bg-primary size-1.5 rounded-full" aria-hidden />
              {isFetching ? 'Refreshing' : 'Live API'}
            </Badge>
          </div>
        </div>

        <ReportToolbar
          table={reportTable}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onApply={handleApply}
          onReset={handleReset}
          onRefresh={() => void refetch()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          isRefreshing={isFetching}
          isExporting={isExporting}
          onPreview={handlePreview}
          onExportExcel={handleExportExcel}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(reportTotals.incomingBags)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Incoming net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.incomingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading bags</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianIntegerTotal(reportTotals.gradingBags)}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Grading net</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.gradingNetWeight)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading ? 'Loading...' : formatIndianWeightTotal(reportTotals.averageWastageKg)}{' '}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">kg</span>
            ) : null}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-sm">
          <p className="text-muted-foreground text-sm">Avg wastage %</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {isLoading
              ? 'Loading...'
              : formatIndianPercentageTotal(reportTotals.averageWastagePercentage)}
            {!isLoading ? (
              <span className="text-muted-foreground text-sm font-medium">%</span>
            ) : null}
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      ) : null}

      <DataTable
        columns={tableColumns}
        data={reportRows}
        isLoading={isLoading}
        onTableReady={handleTableReady}
      />
    </div>
  );
};

export default GradingReportPage;
