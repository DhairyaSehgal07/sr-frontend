import { useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, Banknote, Receipt, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBillBooks } from '@/features/settings/api/use-bill-books';
import { preserveScroll } from '@/lib/preserve-scroll';
import { cn } from '@/lib/utils';

import { useFinanceOutstanding } from './api/use-finance-outstanding';
import { useFinanceRecoveries } from './api/use-finance-recoveries';
import { useFinanceSales } from './api/use-finance-sales';
import { useFinanceSummary } from './api/use-finance-summary';
import { FinancesRecoveryTab } from './components/finances-recovery-tab';
import { FinancesSalesTab } from './components/finances-sales-tab';
import { FinancesSummaryCards } from './components/finances-summary-cards';
import {
  mapFinanceOutstanding,
  mapFinanceRecovery,
  mapFinanceSale,
  mapFinanceSummary,
} from './lib/map-finance';
import { ALL_BILL_BOOKS, type FinancesTab } from './search';

const financesRouteApi = getRouteApi('/_authenticated/finances/');

function FinancesPageSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm" className="gap-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <Skeleton className="ml-auto h-8 w-28" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-11 w-full" />
      <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </>
  );
}

const FinancesPage = () => {
  const { tab, billBookId } = financesRouteApi.useSearch();
  const navigate = financesRouteApi.useNavigate();
  const listParams = useMemo(() => (billBookId ? { billBookId } : {}), [billBookId]);

  const { data: billBooks = [] } = useBillBooks();
  const summaryQuery = useFinanceSummary(listParams);
  const salesQuery = useFinanceSales(listParams);
  const outstandingQuery = useFinanceOutstanding(listParams);
  const recoveriesQuery = useFinanceRecoveries(listParams);

  const isLoading =
    summaryQuery.isLoading ||
    salesQuery.isLoading ||
    outstandingQuery.isLoading ||
    recoveriesQuery.isLoading;

  const errorQuery = [summaryQuery, salesQuery, outstandingQuery, recoveriesQuery].find(
    (query) => query.isError && query.data === undefined,
  );
  const isFetching =
    summaryQuery.isFetching ||
    salesQuery.isFetching ||
    outstandingQuery.isFetching ||
    recoveriesQuery.isFetching;

  const totals = useMemo(
    () => (summaryQuery.data ? mapFinanceSummary(summaryQuery.data) : null),
    [summaryQuery.data],
  );
  const saleRows = useMemo(
    () => (salesQuery.data ?? []).map(mapFinanceSale),
    [salesQuery.data],
  );
  const outstanding = useMemo(
    () => (outstandingQuery.data ?? []).map(mapFinanceOutstanding),
    [outstandingQuery.data],
  );
  const recoveries = useMemo(
    () => (recoveriesQuery.data ?? []).map(mapFinanceRecovery),
    [recoveriesQuery.data],
  );

  const handleTabChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        tab: value as FinancesTab,
        ...(prev.billBookId ? { billBookId: prev.billBookId } : {}),
      }),
      ...preserveScroll,
    });
  };

  const handleBillBookChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        tab: prev.tab,
        ...(value !== ALL_BILL_BOOKS ? { billBookId: value } : {}),
      }),
      ...preserveScroll,
    });
  };

  const handleRetry = () => {
    void summaryQuery.refetch();
    void salesQuery.refetch();
    void outstandingQuery.refetch();
    void recoveriesQuery.refetch();
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="min-w-0 space-y-1">
        <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Finances
        </h1>
        <p className="text-sm text-muted-foreground">
          Sales are posted from billed dispatch vouchers (Dr dispatch ledger / Cr Sales). Recoveries
          collect cash against those parties.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <Field className="sm:max-w-xs">
          <FieldLabel htmlFor="finances-bill-book">Bill book</FieldLabel>
          <Select value={billBookId ?? ALL_BILL_BOOKS} onValueChange={handleBillBookChange}>
            <SelectTrigger id="finances-bill-book" className="h-11 w-full sm:h-9">
              <SelectValue placeholder="All bill books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BILL_BOOKS}>All bill books</SelectItem>
              {billBooks.map((book) => (
                <SelectItem key={book._id} value={book._id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {isLoading ? (
        <FinancesPageSkeleton />
      ) : errorQuery ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-destructive">Finances could not be loaded</p>
                <p className="text-sm text-foreground">
                  {errorQuery.error instanceof Error
                    ? errorQuery.error.message
                    : 'Something went wrong while fetching finances.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isFetching}
              className="h-11 w-full sm:h-9 sm:w-auto"
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {totals ? <FinancesSummaryCards totals={totals} /> : null}

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
            <TabsList className="h-11 w-full">
              <TabsTrigger value="sales">
                <Receipt className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:block">Sales</span>
              </TabsTrigger>
              <TabsTrigger value="recovery">
                <Banknote className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:block">Recovery</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="min-w-0">
              <FinancesSalesTab rows={saleRows} />
            </TabsContent>

            <TabsContent value="recovery" className="min-w-0">
              <FinancesRecoveryTab
                outstanding={outstanding}
                recoveries={recoveries}
                billBookId={billBookId}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
};

export default FinancesPage;
