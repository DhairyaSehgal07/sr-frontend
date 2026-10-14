import { useMemo, useState } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { useColdStoreStock } from './api/use-cold-store-stock';
import type { ColdStoreStock } from './api/types';
import { StockFormDialog, type StockDraft } from './components/stock-form-dialog';
import { StockSummaryCards } from './components/stock-summary-cards';
import { StockSummaryTable } from './components/stock-summary-table';
import {
  ALL_STOCK_FILTERS,
  filterStocks,
  listStockFilters,
  stockMatrix,
  type QuantityMode,
  type StockCell,
} from './lib/stock-matrix';

const QUANTITY_MODES: { value: QuantityMode; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'initial', label: 'Initial' },
  { value: 'outgoing', label: 'Outgoing' },
];

function emptyDraft(stockFilter = ''): StockDraft {
  return {
    stockId: null,
    variety: '',
    size: '',
    stockFilter,
    quantity: '',
  };
}

function draftFromStock(stock: ColdStoreStock): StockDraft {
  return {
    stockId: stock._id,
    variety: stock.variety,
    size: stock.size.name,
    stockFilter: stock.stockFilter?.trim() ?? '',
    quantity: String(stock.size.currentQuantity),
  };
}

function AnalyticsSkeleton() {
  return (
    <>
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-4xl" />
        ))}
      </div>
      <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </>
  );
}

export function AnalyticsPage() {
  const { data: stocks = [], isLoading, isError, error, refetch, isFetching } = useColdStoreStock();
  const [mode, setMode] = useState<QuantityMode>('current');
  const [stockFilter, setStockFilter] = useState(ALL_STOCK_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<StockDraft | null>(null);

  const filters = useMemo(() => listStockFilters(stocks), [stocks]);
  const activeFilter = filters.some((filter) => filter === stockFilter)
    ? stockFilter
    : ALL_STOCK_FILTERS;
  const visibleStocks = useMemo(() => filterStocks(stocks, activeFilter), [stocks, activeFilter]);
  const matrix = useMemo(() => stockMatrix(visibleStocks, mode), [visibleStocks, mode]);

  const openCreate = () => {
    setDraft(emptyDraft(activeFilter === ALL_STOCK_FILTERS ? '' : activeFilter));
    setFormOpen(true);
  };

  const openCell = (variety: string, size: string, cell: StockCell) => {
    const existing = cell.stockId ? stocks.find((stock) => stock._id === cell.stockId) : undefined;
    setDraft(
      existing
        ? draftFromStock(existing)
        : {
            ...emptyDraft(activeFilter === ALL_STOCK_FILTERS ? '' : activeFilter),
            variety,
            size,
          },
    );
    setFormOpen(true);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Analytics
        </h1>
        <Button type="button" className="h-11 w-full sm:w-auto" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Add stock
        </Button>
      </div>

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-destructive">Stock could not be loaded</p>
                <p className="text-sm text-foreground">
                  {error instanceof Error
                    ? error.message
                    : 'Something went wrong while fetching stock.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:h-9 sm:w-auto"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={cn('size-4', isFetching && 'animate-spin')}
                aria-hidden="true"
              />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Tabs value={mode} onValueChange={(value) => setMode(value as QuantityMode)}>
            <TabsList className="flex h-auto w-full items-stretch rounded-full bg-muted p-1 group-data-horizontal/tabs:h-auto">
              {QUANTITY_MODES.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-10! flex-1 rounded-full border-transparent text-sm font-medium text-muted-foreground shadow-none after:hidden hover:text-foreground data-active:bg-background data-active:font-semibold data-active:text-foreground data-active:shadow-sm dark:data-active:border-transparent dark:data-active:bg-background dark:data-active:text-foreground"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <StockSummaryCards matrix={matrix} mode={mode} />

          {filters.length > 0 ? (
            <div className="overflow-x-auto">
              <Tabs value={activeFilter} onValueChange={setStockFilter}>
                <TabsList variant="line" className="h-11 w-max min-w-full justify-start">
                  <TabsTrigger value={ALL_STOCK_FILTERS} className="h-11 flex-none px-3">
                    All
                  </TabsTrigger>
                  {filters.map((filter) => (
                    <TabsTrigger key={filter} value={filter} className="h-11 flex-none px-3">
                      {filter}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          ) : null}

          <StockSummaryTable
            matrix={matrix}
            filtered={activeFilter !== ALL_STOCK_FILTERS}
            onCellClick={openCell}
          />
        </>
      )}

      <StockFormDialog open={formOpen} onOpenChange={setFormOpen} draft={draft} />
    </main>
  );
}
