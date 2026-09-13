import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Globe, History, Loader2, Monitor, RefreshCw, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  BookingAudit,
  BookingAuditRef,
  BookingAuditState,
  BookingGatePassBagSize,
} from '@/features/booking/api/types';
import { useBookingEdits } from '@/features/booking/api/use-booking-edits';
import {
  BOOKING_AUDIT_FIELD_LABELS,
  formatAuditFieldValue,
  getBookingAuditChangedFields,
} from '@/features/booking/utils/format-audit-field-value';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function formatAuditTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function getBookingId(audit: BookingAudit) {
  return typeof audit.bookingId === 'string' ? audit.bookingId : audit.bookingId._id;
}

function formatBookingGatePassTitle(bookingId: BookingAuditRef | string) {
  if (typeof bookingId === 'string') return 'Booking edit';

  const manual =
    bookingId.manualGatePassNumber != null
      ? ` · manual #${formatNumber(bookingId.manualGatePassNumber)}`
      : '';

  return `Gate pass #${formatNumber(bookingId.gatePassNo)}${manual}`;
}

function AuditBagSizesTable({ bagSizes }: { bagSizes: readonly BookingGatePassBagSize[] }) {
  if (bagSizes.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-background">
      <table className="w-full min-w-[360px] caption-bottom text-sm">
        <thead className="border-b border-border/50 bg-muted/50">
          <tr>
            <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">Size</th>
            <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">
              Variety
            </th>
            <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
              Current
            </th>
            <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
              Initial
            </th>
          </tr>
        </thead>
        <tbody>
          {bagSizes.map((slot, index) => (
            <tr
              key={`${slot.size}-${slot.variety}-${slot.currentQuantity}-${slot.initialQuantity}-${index}`}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-3 py-2.5 font-medium text-foreground">{slot.size}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{slot.variety}</td>
              <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
                {formatNumber(slot.currentQuantity)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatNumber(slot.initialQuantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditFieldValue({ field, value }: { field: keyof BookingAuditState; value: unknown }) {
  if (field === 'bagSizes' && Array.isArray(value)) {
    return <AuditBagSizesTable bagSizes={value as BookingGatePassBagSize[]} />;
  }

  return <>{formatAuditFieldValue(field, value)}</>;
}

function BookingEditHistorySkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>
        <ItemContent>
          <Skeleton className="h-5 w-48" />
        </ItemContent>
        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="gap-0 py-0 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="py-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuditChangeTable({ audit }: { audit: BookingAudit }) {
  const changedFields = getBookingAuditChangedFields(audit.previousState, audit.modifiedState);

  if (changedFields.length === 0) {
    return (
      <CardContent className="py-3 text-sm text-muted-foreground">
        No field changes recorded.
      </CardContent>
    );
  }

  return (
    <CardContent className="px-0 pb-0">
      <Table className="min-w-[640px]">
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground">Field</TableHead>
            <TableHead className="text-muted-foreground">Before</TableHead>
            <TableHead className="text-muted-foreground">After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changedFields.map((field) => (
            <TableRow key={field}>
              <TableCell className="align-top font-medium text-foreground">
                {BOOKING_AUDIT_FIELD_LABELS[field]}
              </TableCell>
              <TableCell className="whitespace-normal align-top text-muted-foreground">
                <AuditFieldValue field={field} value={audit.previousState[field]} />
              </TableCell>
              <TableCell className="whitespace-normal align-top text-foreground">
                <AuditFieldValue field={field} value={audit.modifiedState[field]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}

function BookingEditAuditCard({ audit }: { audit: BookingAudit }) {
  const dispatchLedgerName =
    typeof audit.bookingId === 'object' ? audit.bookingId.dispatchLedgerId?.name : undefined;

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/10 sm:px-5">
        <CardTitle className="font-heading text-base font-semibold">
          {formatBookingGatePassTitle(audit.bookingId)}
        </CardTitle>
        <CardDescription>
          {formatAuditTimestamp(audit.createdAt)}
          {dispatchLedgerName ? ` · ${dispatchLedgerName}` : null}
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
            <Link to="/booking/$id" params={{ id: getBookingId(audit) }}>
              View booking
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-2 sm:px-5">
        <div className="flex items-start gap-2 text-sm">
          <User className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">{audit.editedById.name}</p>
            {audit.editedById.mobileNumber ? (
              <p className="text-muted-foreground tabular-nums">{audit.editedById.mobileNumber}</p>
            ) : null}
          </div>
        </div>

        {audit.ipAddress ? (
          <div className="flex items-start gap-2 text-sm">
            <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">IP address</p>
              <p className="font-mono tabular-nums text-muted-foreground">{audit.ipAddress}</p>
            </div>
          </div>
        ) : null}

        {audit.userAgent ? (
          <div className={cn('min-w-0 text-sm', audit.ipAddress ? '' : 'sm:col-span-2')}>
            <div className="flex items-start gap-2">
              <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium text-foreground">User agent</p>
                <p className="truncate text-muted-foreground" title={audit.userAgent}>
                  {audit.userAgent}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>

      <AuditChangeTable audit={audit} />
    </Card>
  );
}

const BookingEditHistoryPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
    }),
    [page, pageSize],
  );

  const { data, isLoading, isError, error, isFetching, refetch } = useBookingEdits(queryParams);

  const audits = data?.audits ?? [];
  const pagination = data?.pagination;
  const totalCount = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? page;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const isOnFirstPage = currentPage <= 1;
  const isOnLastPage = currentPage >= totalPages;

  const handlePrevPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isOnFirstPage || isFetching) return;
    setPage((previous) => Math.max(previous - 1, 1));
  };

  const handleNextPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isOnLastPage || isFetching) return;
    setPage((previous) => previous + 1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value) as PageSize);
    setPage(1);
  };

  if (isLoading) {
    return <BookingEditHistorySkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-9 px-2 text-muted-foreground"
          >
            <Link to="/daybook" search={{ tab: 'booking' }}>
              <ArrowLeft className="mr-1.5 h-5 w-5 text-primary" />
              Back to daybook
            </Link>
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Booking edit history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of booking gate pass changes in your cold storage.
          </p>
        </div>
      </div>

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {totalCount.toLocaleString('en-IN')} edit
            {totalCount === 1 ? '' : 's'}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="mr-2 h-5 w-5 text-primary" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="h-5 w-5 text-primary" />
            </EmptyMedia>
            <EmptyTitle>Could not load edit history</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching edit history.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </Empty>
      ) : audits.length > 0 ? (
        <div className="space-y-4">
          {audits.map((audit) => (
            <BookingEditAuditCard key={audit._id} audit={audit} />
          ))}
        </div>
      ) : (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="h-5 w-5 text-primary" />
            </EmptyMedia>
            <EmptyTitle>No edits recorded yet</EmptyTitle>
            <EmptyDescription>
              Changes to booking gate passes will appear here after they are saved.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Item variant="outline" size="sm" className="rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              disabled={isFetching}
            >
              <SelectTrigger className="h-9 w-18 tabular-nums" aria-label="Items per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>items per page</span>
          </div>

          <Pagination className="mx-0 w-full sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevPage}
                  aria-disabled={isOnFirstPage || isFetching}
                  className={cn(
                    isOnFirstPage || isFetching ? 'pointer-events-none opacity-50' : '',
                  )}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-sm font-medium tabular-nums">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNextPage}
                  aria-disabled={isOnLastPage || isFetching}
                  className={cn(isOnLastPage || isFetching ? 'pointer-events-none opacity-50' : '')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Item>
    </div>
  );
};

export default BookingEditHistoryPage;
