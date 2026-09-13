import { ArrowRight, Eye, FileSpreadsheet, Loader2, RefreshCw, Search } from 'lucide-react';
import type { Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { IncomingGatePassReportRow } from '@/features/incoming-report/api/types';
import { ViewFiltersSheet } from './view-filters';

export interface ReportToolbarProps {
  table: Table<ReportFeatures, IncomingGatePassReportRow>;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onApply: () => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  isExporting?: boolean;
  onPreview?: () => void;
  onExportExcel?: () => void;
  className?: string;
}

export function ReportToolbar({
  table,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  onReset,
  searchQuery,
  onSearchChange,
  isLoading = false,
  isExporting = false,
  onPreview,
  onExportExcel,
  className,
}: ReportToolbarProps) {
  return (
    <div className={cn('overflow-x-auto px-4 py-3 sm:px-6 sm:py-4', className)}>
      <div
        className={cn(
          'flex min-w-min flex-col gap-3 sm:gap-4',
          'lg:min-w-0 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-3',
        )}
      >
        <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3 lg:gap-3">
          <div className="flex min-w-0 items-end gap-2">
            <DatePickerInput
              id="incoming-report-from"
              label="From"
              placeholder="dd.mm.yyyy"
              value={fromDate}
              onChange={onFromDateChange}
              disabled={isLoading}
              className="min-w-0 w-full sm:w-[150px]"
            />

            <span className="flex h-9 shrink-0 items-center" aria-hidden>
              <ArrowRight className="size-4 text-muted-foreground" />
            </span>

            <DatePickerInput
              id="incoming-report-to"
              label="To"
              placeholder="dd.mm.yyyy"
              value={toDate}
              onChange={onToDateChange}
              disabled={isLoading}
              className="min-w-0 w-full sm:w-[150px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <Button type="button" className="min-w-0" onClick={onApply} disabled={isLoading}>
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-0"
              onClick={onReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 lg:min-w-44 lg:flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search manual gate pass…"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            disabled={isLoading}
            className="w-full pl-9"
            aria-label="Search report"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ViewFiltersSheet table={table} />
          <Button
            type="button"
            variant="outline"
            className="min-w-0 gap-1.5 lg:flex-none"
            aria-label="Preview report"
            onClick={onPreview}
            disabled={isLoading}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Preview</span>
          </Button>
          <Button
            type="button"
            className="min-w-0 flex-1 gap-1.5 lg:flex-none"
            aria-label="Export to Excel"
            onClick={onExportExcel}
            disabled={isLoading || isExporting}
          >
            {isExporting ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
            )}
            <span className="truncate">{isExporting ? 'Exporting…' : 'Excel'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Refresh report"
          >
            <RefreshCw className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
