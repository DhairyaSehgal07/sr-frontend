import { Link, useParams } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, BookOpen, Loader2, MapPin, Phone, RefreshCw } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_BILL_BOOKS } from '@/features/finances/search';
import { useBillBooks } from '@/features/settings/api/use-bill-books';
import type { DispatchLedgerFinanceDetail } from '../api/types';
import { useDispatchLedgerFinance } from '../api/use-dispatch-ledger-finance';
import { useDispatchLedgerGatePasses } from '../api/use-dispatch-ledger-gate-passes';
import { BillBookSummary } from './bill-book-summary';
import { GatePassTable } from './gate-pass-table';
import { gatePassBillBookId } from './lib';
import { MaterialSummary } from './material-summary';
import { MoneySummary } from './money-summary';
import { RecoveriesTable } from './recoveries-table';
import { SalesTable } from './sales-table';
import { StockSummary } from './stock-summary';

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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="min-w-0 space-y-1">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm" className="gap-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <Skeleton className="ml-auto h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
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

  const selectedBookName = billBookId
    ? bookOptions.find((book) => book.id === billBookId)?.name
    : undefined;

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
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <h1
                className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                title={finance.dispatchLedger.name}
              >
                {finance.dispatchLedger.name}
              </h1>
              <p className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {finance.dispatchLedger.mobileNumber ? (
                  <span className="tabular-nums">{finance.dispatchLedger.mobileNumber}</span>
                ) : (
                  <span className="text-muted-foreground">Mobile number not available</span>
                )}
              </p>
              <p className="flex items-start gap-2 text-sm text-foreground">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0" title={finance.dispatchLedger.address}>
                  {finance.dispatchLedger.address || 'Address not available'}
                </span>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              disabled={refreshing}
              className="h-11 w-full sm:h-9 sm:w-auto"
            >
              {refreshing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              Refresh
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

          <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:p-4">
            <Field className="sm:max-w-xs">
              <FieldLabel htmlFor="dispatch-ledger-bill-book">Bill book</FieldLabel>
              <Select
                value={billBookId ?? ALL_BILL_BOOKS}
                onValueChange={(value) =>
                  setBillBookId(value === ALL_BILL_BOOKS ? undefined : value)
                }
              >
                <SelectTrigger id="dispatch-ledger-bill-book" className="h-11 w-full sm:h-9">
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
              <FieldDescription>
                Bills, recoveries, and gate passes follow this book.
              </FieldDescription>
            </Field>
          </div>

          <MoneySummary summary={finance.summary} />

          <Section
            title="Material dispatched"
            description={
              selectedBookName
                ? `Bags and weight on gate passes in ${selectedBookName}.`
                : 'Bags and weight that left the store for this party.'
            }
          >
            {gatePassQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-4xl" />
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
              <MaterialSummary passes={visiblePasses} bookName={selectedBookName} />
            )}
          </Section>

          {gatePassQuery.isLoading || gatePassQuery.isError ? null : (
            <Section
              title="Stock dispatched"
              description={
                selectedBookName
                  ? `Variety and bag size totals on gate passes in ${selectedBookName}.`
                  : 'Bags of each variety, split by the sizes that were dispatched.'
              }
            >
              <StockSummary passes={visiblePasses} bookFiltered={Boolean(billBookId)} />
            </Section>
          )}

          <Section
            title="By bill book"
            description="Where the bill was cut, what has been collected, and what is still open."
          >
            <BillBookSummary
              rows={finance.byBillBook}
              summary={finance.summary}
              bookFiltered={Boolean(billBookId)}
            />
          </Section>

          {gatePassQuery.isError ? null : (
            <Section
              title="Dispatch gate passes"
              description="Each voucher issued to this party, newest gate pass number first."
            >
              {gatePassQuery.isLoading ? (
                <div className="space-y-2 overflow-hidden rounded-lg border border-border p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <GatePassTable passes={visiblePasses} bookFiltered={Boolean(billBookId)} />
              )}
            </Section>
          )}

          <Section
            title="Bills"
            description="Sales posted from booked gate passes, with what this party still owes on each."
          >
            <SalesTable sales={finance.sales} bookFiltered={Boolean(billBookId)} />
          </Section>

          <Section
            title="Recoveries"
            description="Payments received, and the bill each amount was applied to."
          >
            <RecoveriesTable
              recoveries={finance.recoveries}
              sales={finance.sales}
              bookFiltered={Boolean(billBookId)}
            />
          </Section>
        </>
      )}
    </main>
  );
};

export default DispatchLedgerDetailPage;
