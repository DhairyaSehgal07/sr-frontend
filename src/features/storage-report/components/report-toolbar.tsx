import type { Table } from '@tanstack/react-table';
import { Eye, FileSpreadsheet, Loader2, RefreshCw, Search } from 'lucide-react';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StorageGatePass } from '@/features/storage/api/types';
import { cn } from '@/lib/utils';

import { ViewFiltersSheet } from './view-filters';

export interface ReportToolbarProps {
  table: Table<ReportFeatures, StorageGatePass> | null;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isExporting?: boolean;
  onPreview?: () => void;
  onExportExcel?: () => void;
  className?: string;
}

export function ReportToolbar({
  table,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
  onRefresh,
  searchQuery,
  onSearchChange,
  isLoading = false,
  isRefreshing = false,
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
          <label className="grid min-w-0 gap-1.5 sm:w-[180px]">
            <span className="text-sm font-medium text-foreground">From</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              disabled={isRefreshing}
              className="h-10"
            />
          </label>

          <label className="grid min-w-0 gap-1.5 sm:w-[180px]">
            <span className="text-sm font-medium text-foreground">To</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              disabled={isRefreshing}
              className="h-10"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <Button type="button" className="min-w-0" disabled={isRefreshing} onClick={onApply}>
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-0"
              disabled={isRefreshing}
              onClick={onReset}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 lg:min-w-44 lg:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search storage report..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            disabled={isLoading}
            className="w-full pl-9"
            aria-label="Search storage report"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {table ? <ViewFiltersSheet table={table} /> : null}

          <Button
            type="button"
            variant="outline"
            className="min-w-0 gap-1.5 lg:flex-none"
            aria-label="Preview storage report"
            onClick={onPreview}
            disabled={isLoading || !table}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Preview</span>
          </Button>

          <Button
            type="button"
            className="min-w-0 gap-1.5 lg:flex-none"
            aria-label="Export storage report to Excel"
            onClick={onExportExcel}
            disabled={isLoading || isExporting || !table}
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
            aria-label="Refresh storage report"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
