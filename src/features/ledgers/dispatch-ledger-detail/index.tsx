import { Link, useParams } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
import { ALL_BILL_BOOKS } from '@/features/finances/search';
import { useBillBooks } from '@/features/settings/api/use-bill-books';
import type { DispatchLedgerFinanceDetail } from '../api/types';
import { useDispatchLedgerFinance } from '../api/use-dispatch-ledger-finance';
import { useDispatchLedgerGatePasses } from '../api/use-dispatch-ledger-gate-passes';
import type { DispatchLedger } from '../types';
import { BillBookSummary } from './bill-book-summary';
import { GatePassTable } from './gate-pass-table';
import { gatePassBillBookId } from './lib';
import { LedgerTotals } from './money-summary';
import { RecoveriesTable } from './recoveries-table';
import { SalesTable } from './sales-table';
import { StockSummary } from './stock-summary';

function partyContact(ledger: DispatchLedger) {
  const mobile = ledger.mobileNumber?.trim() || 'No mobile';
  const address = ledger.address?.trim() || 'No address';
  return `${mobile} · ${address}`;
}

function BackLink() {
  return (
    <Link
      to="/ledgers"
      className="inline-flex h-11 items-center gap-1.5 self-start text-sm font-medium text-foreground underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Ledgers
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-full" />
      </div>
      <Skeleton className="h-11 w-full sm:max-w-xs" />
      <div className="overflow-hidden rounded-lg border border-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-none" />
        ))}
      </div>
      <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function LoadError({
  title,
  message,
  onRetry,
  pending,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-destructive">{title}</p>
            <p className="text-sm text-foreground">{message}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={pending}
          className="h-11 w-full sm:h-9 sm:w-auto"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          Try again
        </Button>
      </div>
    </div>
  );
}

const DispatchLedgerDetailPage = () => {
  const { id } = useParams({ from: '/_authenticated/ledgers/$id' });
  const [billBookId, setBillBookId] = useState<string | undefined>();
  const listParams = useMemo(() => (billBookId ? { billBookId } : {}), [billBookId]);

  const financeQuery = useDispatchLedgerFinance(id, listParams);
  const gatePassQuery = useDispatchLedgerGatePasses(id);
  const { data: billBooks = [] } = useBillBooks();

  const finance: DispatchLedgerFinanceDetail | undefined =
    financeQuery.data && financeQuery.data.dispatchLedger._id === id
      ? financeQuery.data
      : undefined;

  const bookOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const book of billBooks) names.set(book._id, book.name);
    for (const row of finance?.byBillBook ?? []) {
      if (!names.has(row.billBookId)) names.set(row.billBookId, row.billBookName);
    }
    if (billBookId && !names.has(billBookId)) names.set(billBookId, 'Bill book');
    return [...names.entries()].map(([bookId, name]) => ({ id: bookId, name }));
  }, [billBookId, billBooks, finance?.byBillBook]);

  const visiblePasses = useMemo(() => {
    const passes = gatePassQuery.data ?? [];
    if (!billBookId) return passes;
    return passes.filter((pass) => gatePassBillBookId(pass) === billBookId);
  }, [billBookId, gatePassQuery.data]);

  const waitingForParty = !finance && (financeQuery.isLoading || financeQuery.isFetching);
  const partyMissing =
    !financeQuery.isError && !finance && financeQuery.data === null && !financeQuery.isFetching;

  const refresh = () => {
    void financeQuery.refetch();
    void gatePassQuery.refetch();
  };

  const refreshing = financeQuery.isFetching || gatePassQuery.isFetching;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6">
      <BackLink />

      {waitingForParty ? (
        <DetailSkeleton />
      ) : financeQuery.isError && !finance ? (
        <LoadError
          title="Could not load this party"
          message={
            financeQuery.error instanceof Error
              ? financeQuery.error.message
              : 'Something went wrong while fetching this dispatch ledger.'
          }
          onRetry={refresh}
          pending={refreshing}
        />
      ) : partyMissing || !finance ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>Dispatch ledger not found</EmptyTitle>
            <EmptyDescription>
              This party is not in the current cold storage, or the link is out of date.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h1
                className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                title={finance.dispatchLedger.name}
              >
                {finance.dispatchLedger.name}
              </h1>
              <p
                className="truncate text-sm text-muted-foreground tabular-nums"
                title={partyContact(finance.dispatchLedger)}
              >
                {partyContact(finance.dispatchLedger)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="size-11 shrink-0"
            >
              {refreshing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {financeQuery.isError ? (
            <LoadError
              title="Could not refresh this party"
              message={
                financeQuery.error instanceof Error
                  ? financeQuery.error.message
                  : 'The latest bill book filter could not be loaded.'
              }
              onRetry={() => void financeQuery.refetch()}
              pending={financeQuery.isFetching}
            />
          ) : null}

          <Field className="w-full sm:max-w-xs">
            <FieldLabel htmlFor="dispatch-ledger-bill-book">Bill book</FieldLabel>
            <Select
              value={billBookId ?? ALL_BILL_BOOKS}
              onValueChange={(value) => setBillBookId(value === ALL_BILL_BOOKS ? undefined : value)}
            >
              <SelectTrigger id="dispatch-ledger-bill-book" className="h-11 w-full">
                <SelectValue placeholder="All bill books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_BILL_BOOKS}>All bill books</SelectItem>
                {bookOptions.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <LedgerTotals
            summary={finance.summary}
            passes={gatePassQuery.isSuccess ? visiblePasses : null}
          />

          {gatePassQuery.isLoading ? (
            <Section title="Stock dispatched">
              <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            </Section>
          ) : gatePassQuery.isError ? null : (
            <Section title="Stock dispatched">
              <StockSummary passes={visiblePasses} bookFiltered={Boolean(billBookId)} />
            </Section>
          )}

          <Tabs defaultValue="gate-passes" className="min-w-0 gap-4 border-t border-border pt-6">
            <TabsList className="grid h-11 w-full grid-cols-3">
              <TabsTrigger value="gate-passes" className="px-2">
                Gate passes
              </TabsTrigger>
              <TabsTrigger value="bills" className="px-2">
                Bills
              </TabsTrigger>
              <TabsTrigger value="recoveries" className="px-2">
                Recoveries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gate-passes" className="min-w-0">
              {gatePassQuery.isLoading ? (
                <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : gatePassQuery.isError ? (
                <LoadError
                  title="Could not load dispatch gate passes"
                  message={
                    gatePassQuery.error instanceof Error
                      ? gatePassQuery.error.message
                      : 'Dispatch gate passes could not be loaded.'
                  }
                  onRetry={() => void gatePassQuery.refetch()}
                  pending={gatePassQuery.isFetching}
                />
              ) : (
                <GatePassTable passes={visiblePasses} bookFiltered={Boolean(billBookId)} />
              )}
            </TabsContent>

            <TabsContent value="bills" className="flex min-w-0 flex-col gap-4">
              <BillBookSummary
                rows={finance.byBillBook}
                summary={finance.summary}
                bookFiltered={Boolean(billBookId)}
              />
              <SalesTable sales={finance.sales} bookFiltered={Boolean(billBookId)} />
            </TabsContent>

            <TabsContent value="recoveries" className="min-w-0">
              <RecoveriesTable
                recoveries={finance.recoveries}
                sales={finance.sales}
                bookFiltered={Boolean(billBookId)}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
};

export default DispatchLedgerDetailPage;
