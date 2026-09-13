import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, ChevronRight, Package, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingSummaryTable } from '@/features/booking/components/booking-summary-table';
import type { SummaryVariety } from '@/features/booking/api/summary-types';
import {
  buildBookingSummaryTable,
  computeNetAvailable,
  formatBookingBagCount,
  mapApiSummaryToVarietySummary,
} from '@/features/booking/lib/booking-summary-utils';
import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';
import { mapShedSummaryToVarietySummary } from '@/features/outgoing/utils/map-shed-summary';
import { cn } from '@/lib/utils';

type BookingSummaryProps = {
  bookingQuery: UseQueryResult<SummaryVariety[], Error>;
  storageQuery: UseQueryResult<SummaryVariety[], Error>;
  shedQuery: UseQueryResult<BookingVarietySummary[], Error>;
};

type BookingSummaryCollapsibleSectionProps = {
  title: string;
  description: string;
  grandTotal: number;
  children: React.ReactNode;
};

function BookingSummaryCollapsibleSection({
  title,
  description,
  grandTotal,
  children,
}: BookingSummaryCollapsibleSectionProps) {
  return (
    <Collapsible
      defaultOpen={false}
      className="group overflow-hidden rounded-lg border border-border"
    >
      <CollapsibleTrigger
        className={cn(
          'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:bg-muted/20 sm:px-5',
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-heading text-sm font-semibold text-foreground sm:text-base">{title}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-primary">
            {formatBookingBagCount(grandTotal)} bags
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border bg-muted/10 px-3 py-4 sm:px-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function BookingSummarySkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-10 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}

export function BookingSummary({ bookingQuery, storageQuery, shedQuery }: BookingSummaryProps) {
  const {
    data: bookingData,
    error: bookingError,
    isError: isBookingError,
    isLoading: isBookingLoading,
    isFetching: isBookingFetching,
    refetch: refetchBooking,
  } = bookingQuery;

  const {
    data: storageData,
    error: storageError,
    isError: isStorageError,
    isLoading: isStorageLoading,
    isFetching: isStorageFetching,
    refetch: refetchStorage,
  } = storageQuery;

  const {
    data: shedData,
    error: shedError,
    isError: isShedError,
    isLoading: isShedLoading,
    isFetching: isShedFetching,
    refetch: refetchShed,
  } = shedQuery;

  const isLoading =
    (isBookingLoading && bookingData === undefined) ||
    (isStorageLoading && storageData === undefined) ||
    (isShedLoading && shedData === undefined);
  const isError =
    (isBookingError && bookingData === undefined) ||
    (isStorageError && storageData === undefined) ||
    (isShedError && shedData === undefined);
  const isFetching = isBookingFetching || isStorageFetching || isShedFetching;

  const mappedStorage = useMemo(
    () => mapApiSummaryToVarietySummary(storageData ?? [], 'current'),
    [storageData],
  );
  const mappedBooked = useMemo(
    () => mapApiSummaryToVarietySummary(bookingData ?? [], 'current'),
    [bookingData],
  );
  const mappedShed = useMemo(
    () => mapShedSummaryToVarietySummary(shedData ?? []),
    [shedData],
  );

  const totalTable = useMemo(() => buildBookingSummaryTable(mappedStorage), [mappedStorage]);
  const shedTable = useMemo(() => buildBookingSummaryTable(mappedShed), [mappedShed]);
  const bookedTable = useMemo(() => buildBookingSummaryTable(mappedBooked), [mappedBooked]);
  const netTable = useMemo(() => {
    const netData = computeNetAvailable(mappedStorage, mappedBooked, mappedShed);
    return buildBookingSummaryTable(netData);
  }, [mappedStorage, mappedBooked, mappedShed]);

  const handleRetry = () => {
    void refetchBooking();
    void refetchStorage();
    void refetchShed();
  };

  if (isLoading) {
    return <BookingSummarySkeleton />;
  }

  if (isError) {
    const errorMessage =
      bookingError?.message ??
      storageError?.message ??
      shedError?.message ??
      'Something went wrong while fetching booking summary data.';

    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Booking summary could not be loaded
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn('mr-2 size-4', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold sm:text-lg">
                <Package className="size-5 text-primary" aria-hidden />
                Net available for booking
              </CardTitle>
              <CardDescription>
                Remaining stock after booked quantities are subtracted from total inventory plus
                shed stock.
              </CardDescription>
            </div>
            <div className="rounded-lg border border-border bg-primary/10 px-4 py-2.5 text-right">
              <p className="text-xs font-medium text-muted-foreground">Net total</p>
              <p className="font-heading text-xl font-semibold tabular-nums text-primary">
                {formatBookingBagCount(netTable.grandTotal)}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-foreground">
            Quantity{' '}
            <span className="tabular-nums text-muted-foreground">
              ({formatBookingBagCount(netTable.grandTotal)})
            </span>
          </p>
        </CardHeader>

        <CardContent>
          <BookingSummaryTable
            table={netTable}
            emptyMessage="No net availability data available."
          />
        </CardContent>
      </Card>

      <BookingSummaryCollapsibleSection
        title="Total stock"
        description="Full inventory available across varieties and bag sizes."
        grandTotal={totalTable.grandTotal}
      >
        <BookingSummaryTable table={totalTable} emptyMessage="No total stock data available." />
      </BookingSummaryCollapsibleSection>

      <BookingSummaryCollapsibleSection
        title="Shed stock"
        description="Bags currently held in the shed, included in net available for booking."
        grandTotal={shedTable.grandTotal}
      >
        <BookingSummaryTable table={shedTable} emptyMessage="No shed stock data available." />
      </BookingSummaryCollapsibleSection>

      <BookingSummaryCollapsibleSection
        title="Booked quantities"
        description="Bags already committed through booking gate passes."
        grandTotal={bookedTable.grandTotal}
      >
        <BookingSummaryTable
          table={bookedTable}
          emptyMessage="No booked quantity data available."
        />
      </BookingSummaryCollapsibleSection>
    </div>
  );
}
