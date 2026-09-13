import { useMemo, type MouseEvent } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRightFromLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Loader2,
  RefreshCw,
  Scale,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  StorageGatePassCard,
  StorageGatePassCardSkeleton,
} from '@/components/storage-gate-pass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDaybook } from '@/features/daybook/api/use-daybook';
import type { DaybookQueryParams } from '@/features/daybook/api/types';
import {
  DaybookOutgoingGatePassCard,
  DaybookOutgoingGatePassCardSkeleton,
} from '@/features/daybook/components/daybook-outgoing-gate-pass-card';
import {
  paginationRangeLabel,
  storagePaginationToDaybook,
} from '@/features/daybook/utils/daybook-display';
import { daybookStorageEntryToGatePass } from '@/features/daybook/utils/daybook-storage-adapter';
import {
  isOutgoingEntry,
  isRenderableDaybookEntry,
  isStorageEntry,
} from '@/features/daybook/utils/daybook-type-guards';
import { useStorageGatePasses } from '@/features/storage/api/use-storage-gate-passes';
import type { StorageGatePassListParams } from '@/features/storage/api/types';
import { nikasiAccent } from '@/features/dispatch-pre-storage/constants/nikasi-accent';
import type { DaybookListType, DaybookSortBy } from '@/features/daybook/search';
import { preserveScroll } from '@/lib/preserve-scroll';
import { cn } from '@/lib/utils';

const daybookRouteApi = getRouteApi('/_authenticated/daybook');

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type SortFilter = 'newest' | 'oldest';

function toSortBy(sort: SortFilter): DaybookSortBy {
  return sort === 'newest' ? 'latest' : 'oldest';
}

function fromSortBy(sortBy: DaybookSortBy): SortFilter {
  return sortBy === 'latest' ? 'newest' : 'oldest';
}

function StorageTabSkeleton() {
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

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <Skeleton className="h-11 w-full rounded-md" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full rounded-md sm:w-[150px]" />
            <Skeleton className="h-10 w-full rounded-md sm:w-[150px]" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <StorageGatePassCardSkeleton />
        <DaybookOutgoingGatePassCardSkeleton />
        <StorageGatePassCardSkeleton />
      </div>

      <Item variant="outline" size="sm" className="rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-18 rounded-md" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </Item>
    </div>
  );
}

const DaybookStorageTab = () => {
  const navigate = useNavigate();
  const routeNavigate = daybookRouteApi.useNavigate();
  const search = daybookRouteApi.useSearch();

  const type: DaybookListType = search.type ?? 'all';
  const sortBy: DaybookSortBy = search.sortBy ?? 'latest';
  const page = search.page ?? 1;
  const pageSize = (search.limit ?? DEFAULT_PAGE_SIZE) as PageSize;
  const sortFilter = fromSortBy(sortBy);

  const queryParams = useMemo<DaybookQueryParams>(
    () => ({
      type,
      sortBy,
      page,
      limit: pageSize,
    }),
    [type, sortBy, page, pageSize],
  );

  const storageListParams = useMemo<StorageGatePassListParams>(
    () => ({
      page,
      limit: pageSize,
      sortOrder: sortFilter === 'newest' ? 'desc' : 'asc',
    }),
    [page, pageSize, sortFilter],
  );

  const daybookQuery = useDaybook(queryParams);
  const isLegacyDaybook = daybookQuery.data?.format === 'legacy';
  const useStorageFeed = isLegacyDaybook && type !== 'outgoing';

  const storageQuery = useStorageGatePasses(storageListParams, {
    enabled: useStorageFeed && !daybookQuery.isLoading,
  });

  const isLoading = daybookQuery.isLoading || (useStorageFeed && storageQuery.isLoading);
  const isError = useStorageFeed ? storageQuery.isError : daybookQuery.isError;
  const error = useStorageFeed ? storageQuery.error : daybookQuery.error;
  const isFetching = useStorageFeed ? storageQuery.isFetching : daybookQuery.isFetching;

  const refetch = () => {
    if (useStorageFeed) {
      return storageQuery.refetch();
    }

    return daybookQuery.refetch();
  };

  const daybookEntries = Array.isArray(daybookQuery.data?.entries) ? daybookQuery.data.entries : [];
  const renderableEntries = daybookEntries.filter(isRenderableDaybookEntry);
  const hasUnsupportedEntries =
    !useStorageFeed && daybookEntries.length > 0 && renderableEntries.length === 0;
  const storageGatePasses = storageQuery.data?.storageGatePasses ?? [];

  const pagination = useStorageFeed
    ? storageQuery.data?.pagination
      ? storagePaginationToDaybook(storageQuery.data.pagination)
      : undefined
    : daybookQuery.data?.pagination;

  const totalCount = useStorageFeed
    ? (pagination?.totalItems ?? 0)
    : isLegacyDaybook && type === 'outgoing'
      ? 0
      : (pagination?.totalItems ?? 0);
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const isOnFirstPage = pagination ? !pagination.hasPreviousPage : currentPage <= 1;
  const isOnLastPage = pagination ? !pagination.hasNextPage : currentPage >= totalPages;

  const updateFilters = (
    patch: Partial<{
      type: DaybookListType;
      sortBy: DaybookSortBy;
      page: number;
      limit: PageSize;
    }>,
  ) => {
    routeNavigate({
      search: (previous) => ({
        ...previous,
        tab: 'storage',
        ...patch,
      }),
      ...preserveScroll,
    });
  };

  const handlePrevPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isOnFirstPage || isFetching) return;

    const previousPage = pagination?.previousPage ?? Math.max(currentPage - 1, 1);
    updateFilters({ page: previousPage });
  };

  const handleNextPage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isOnLastPage || isFetching) return;

    const nextPage = pagination?.nextPage ?? currentPage + 1;
    updateFilters({ page: nextPage });
  };

  const handleAddStorage = () => {
    navigate({ to: '/storage' });
  };

  const handleAddOutgoing = () => {
    navigate({ to: '/outgoing' });
  };

  const handleEditHistory = () => {
    navigate({ to: '/storage/edit-history' });
  };

  const handleTransferStock = () => {
    navigate({ to: '/transfer' });
  };

  const handleTypeChange = (value: string) => {
    updateFilters({ type: value as DaybookListType, page: 1 });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: toSortBy(value as SortFilter), page: 1 });
  };

  const handlePageSizeChange = (value: string) => {
    updateFilters({
      limit: Number(value) as PageSize,
      page: 1,
    });
  };

  if (isLoading) {
    return <StorageTabSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{totalCount.toLocaleString('en-IN')} gate passes</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search by gate pass number (coming soon)"
            className="w-full pl-10"
            inputMode="numeric"
            disabled
            aria-disabled
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All passes</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortFilter} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Button
              variant="secondary"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={handleTransferStock}
            >
              <ArrowRightLeft className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate sm:hidden">Transfer Stock</span>
              <span className="hidden sm:inline">Transfer Stock</span>
            </Button>

            <Button
              variant="secondary"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={handleEditHistory}
            >
              <span className="truncate sm:hidden">Edit History</span>
              <span className="hidden sm:inline">Storage Edit History</span>
            </Button>

            <Button className="min-w-0 px-2.5 sm:px-3" onClick={handleAddStorage}>
              <ArrowUpFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Storage</span>
            </Button>

            <Button
              variant="outline"
              className={cn(
                'min-w-0 px-2.5 sm:px-3 transition-colors',
                nikasiAccent.emphasis,
                'border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:hover:bg-rose-950/70',
              )}
              onClick={handleAddOutgoing}
            >
              <ArrowRightFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Outgoing</span>
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scale />
            </EmptyMedia>

            <EmptyTitle>Could not load daybook</EmptyTitle>

            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching gate passes.'}
            </EmptyDescription>
          </EmptyHeader>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Try again
          </Button>
        </Empty>
      ) : hasUnsupportedEntries ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scale />
            </EmptyMedia>

            <EmptyTitle>Daybook response format mismatch</EmptyTitle>

            <EmptyDescription>
              The server returned {totalCount.toLocaleString('en-IN')} entries, but none match the
              storage/outgoing daybook format. Ensure the production backend is on v1.23.0 or newer
              and redeployed with the frontend.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLegacyDaybook && type === 'outgoing' ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scale />
            </EmptyMedia>

            <EmptyTitle>Outgoing list unavailable</EmptyTitle>

            <EmptyDescription>
              Outgoing gate passes in the daybook require backend v1.23.0 or newer. Redeploy the
              backend to view outgoing deliveries here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : useStorageFeed && storageGatePasses.length > 0 ? (
        <div className="space-y-6">
          {storageGatePasses.map((gatePass) => (
            <StorageGatePassCard key={gatePass._id} data={gatePass} />
          ))}
        </div>
      ) : renderableEntries.length > 0 ? (
        <div className="space-y-6">
          {renderableEntries.map((entry) =>
            isStorageEntry(entry) ? (
              <StorageGatePassCard key={entry._id} data={daybookStorageEntryToGatePass(entry)} />
            ) : isOutgoingEntry(entry) ? (
              <DaybookOutgoingGatePassCard key={entry._id} data={entry} />
            ) : null,
          )}
        </div>
      ) : (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scale />
            </EmptyMedia>

            <EmptyTitle>No gate passes yet</EmptyTitle>

            <EmptyDescription>
              Storage receipts and outgoing deliveries will appear here once recorded.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Item variant="outline" size="sm" className="rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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
            {pagination ? (
              <span className="text-sm text-muted-foreground">
                {paginationRangeLabel(pagination)}
              </span>
            ) : null}
          </div>

          <Pagination className="mx-0 w-full sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevPage}
                  aria-disabled={isOnFirstPage || isFetching}
                  className={isOnFirstPage || isFetching ? 'pointer-events-none opacity-50' : ''}
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
                  className={isOnLastPage || isFetching ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Item>
    </div>
  );
};

export default DaybookStorageTab;
