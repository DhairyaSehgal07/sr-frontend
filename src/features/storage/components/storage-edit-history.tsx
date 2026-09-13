import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Globe, History, Loader2, MapPin, Monitor, RefreshCw, User } from 'lucide-react';

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
  StorageGatePassAudit,
  StorageGatePassAuditState,
  StorageGatePassBagSize,
} from '@/features/storage/api/types';
import { useStorageGatePassEdits } from '@/features/storage/api/use-storage-gate-pass-edits';
import {
  formatAuditFieldValue,
  getStorageGatePassAuditChangedFields,
  STORAGE_GATE_PASS_AUDIT_FIELD_LABELS,
} from '@/features/storage/utils/format-audit-field-value';
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

function formatLocation(slot: StorageGatePassBagSize) {
  const parts = [slot.chamber, slot.floor, slot.row].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : '-';
}

function AuditBagSizesTable({ bagSizes }: { bagSizes: readonly StorageGatePassBagSize[] }) {
  if (bagSizes.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-background">
      <table className="w-full min-w-[480px] caption-bottom text-sm">
        <thead className="border-b border-border/50 bg-muted/50">
          <tr>
            <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">Size</th>
            <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">Type</th>
            <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
              Current
            </th>
            <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
              Initial
            </th>
            <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {bagSizes.map((slot, index) => (
            <tr
              key={`${slot.size}-${slot.bagType}-${slot.chamber}-${slot.floor}-${slot.row}-${index}`}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-3 py-2.5 font-medium text-foreground">{slot.size}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{slot.bagType}</td>
              <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
                {formatNumber(slot.currentQuantity)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatNumber(slot.initialQuantity)}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {formatLocation(slot)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditFieldValue({
  field,
  value,
}: {
  field: keyof StorageGatePassAuditState;
  value: unknown;
}) {
  if (field === 'bagSizes' && Array.isArray(value)) {
    return <AuditBagSizesTable bagSizes={value as StorageGatePassBagSize[]} />;
  }

  return <>{formatAuditFieldValue(field, value)}</>;
}

function StorageEditHistorySkeleton() {
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

function AuditChangeTable({ audit }: { audit: StorageGatePassAudit }) {
  const changedFields = getStorageGatePassAuditChangedFields(
    audit.previousState,
    audit.modifiedState,
  );

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
                {STORAGE_GATE_PASS_AUDIT_FIELD_LABELS[field]}
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

function StorageEditAuditCard({ audit }: { audit: StorageGatePassAudit }) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/10 sm:px-5">
        <CardTitle className="font-heading text-base font-semibold">Gate pass edit</CardTitle>
        <CardDescription>{formatAuditTimestamp(audit.createdAt)}</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
            <Link to="/storage/$id" params={{ id: audit.storageGatePassId }}>
              View gate pass
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

const StorageEditHistory = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
    }),
    [page, pageSize],
  );

  const { data, isLoading, isError, error, isFetching, refetch } =
    useStorageGatePassEdits(queryParams);

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
    return <StorageEditHistorySkeleton />;
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
            <Link to="/daybook" search={{ tab: 'storage' }}>
              <ArrowLeft className="mr-1.5 h-5 w-5 text-primary" />
              Back to daybook
            </Link>
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Storage edit history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of storage gate pass changes in your cold storage.
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
            <StorageEditAuditCard key={audit._id} audit={audit} />
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
              Changes to storage gate passes will appear here after they are saved.
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

export default StorageEditHistory;
