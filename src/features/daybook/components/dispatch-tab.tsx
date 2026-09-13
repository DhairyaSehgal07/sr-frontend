import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDebounceValue } from 'usehooks-ts';
import { ArrowUpFromLine, Loader2, PackageCheck, RefreshCw, Search } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DispatchPreStorageGatePassCard,
  DispatchPreStorageGatePassCardSkeleton,
} from '@/features/dispatch-pre-storage/components/dispatch-pre-storage-gate-pass-card';
import { useNikasiGatePasses } from '@/features/dispatch-pre-storage/api/use-nikasi-gate-passes';
import type { NikasiGatePassListParams } from '@/features/dispatch-pre-storage/api/types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
const SEARCH_DEBOUNCE_MS = 500;

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type SortFilter = 'newest' | 'oldest';

function toSortOrder(sort: SortFilter): NikasiGatePassListParams['sortOrder'] {
  return sort === 'newest' ? 'desc' : 'asc';
}

function parseGatePassSearchNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return undefined;

  const parsed = Number(trimmed);
  return parsed > 0 ? parsed : undefined;
}

function DispatchTabSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>

        <ItemContent>
          <Skeleton className="h-5 w-56" />
        </ItemContent>

        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <Skeleton className="h-11 w-full rounded-md" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Skeleton className="h-10 w-full rounded-md sm:w-[150px]" />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Skeleton className="h-10 w-full rounded-md sm:w-48" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <DispatchPreStorageGatePassCardSkeleton key={index} />
        ))}
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

const DaybookDispatchTab = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [sortFilter, setSortFilter] = useState<SortFilter>('newest');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', SEARCH_DEBOUNCE_MS);

  const searchNumber = useMemo(() => parseGatePassSearchNumber(debouncedSearch), [debouncedSearch]);
  const isSearchMode = searchNumber != null;
  const hasInvalidSearchInput = debouncedSearch.trim().length > 0 && searchNumber == null;

  const listQueryParams = useMemo<NikasiGatePassListParams>(
    () =>
      isSearchMode
        ? {
            page: 1,
            limit: pageSize,
            sortOrder: toSortOrder(sortFilter),
            gatePassNo: searchNumber,
          }
        : {
            page,
            limit: pageSize,
            sortOrder: toSortOrder(sortFilter),
          },
    [page, pageSize, sortFilter, isSearchMode, searchNumber],
  );

  const { data, isLoading, isError, error, isFetching, refetch } = useNikasiGatePasses(
    listQueryParams,
    {
      enabled: !hasInvalidSearchInput,
    },
  );

  const nikasiGatePasses = hasInvalidSearchInput ? [] : (data?.nikasiGatePasses ?? []);
  const pagination = hasInvalidSearchInput ? undefined : data?.pagination;
  const totalCount = isSearchMode ? nikasiGatePasses.length : (pagination?.total ?? 0);
  const currentPage = pagination?.page ?? page;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  const isOnFirstPage = currentPage <= 1;
  const isOnLastPage = currentPage >= totalPages;
  const showListLoading = !isSearchMode && isLoading;
  const showSearchLoading = isSearchMode && isFetching && !data;

  const emptyTitle = hasInvalidSearchInput
    ? 'Invalid gate pass number'
    : isSearchMode
      ? 'No dispatch gate pass found'
      : 'No dispatch gate passes found';
  const emptyDescription = hasInvalidSearchInput
    ? 'Enter a valid numeric gate pass number to search.'
    : isSearchMode
      ? `No gate pass matches #${searchNumber}.`
      : 'There are no nikasi gate passes for this cold storage yet.';

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

  const handleAddDispatch = () => {
    navigate({ to: '/dispatch' });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setDebouncedSearch(value);
  };

  const handleSortChange = (value: string) => {
    setSortFilter(value as SortFilter);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value) as PageSize);
    setPage(1);
  };

  if (showListLoading) {
    return <DispatchTabSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <PackageCheck className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{totalCount} dispatch gate passes</ItemTitle>
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
            placeholder="Enter Gate Pass Number"
            className="w-full pl-10"
            inputMode="numeric"
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Select value={sortFilter} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Button variant="secondary" className="min-w-0 px-2.5 sm:px-3">
              <span className="truncate sm:hidden">Edit History</span>
              <span className="hidden sm:inline">Dispatch Edit History</span>
            </Button>

            <Button onClick={handleAddDispatch} className="min-w-0 px-2.5 sm:px-3">
              <ArrowUpFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Dispatch</span>
            </Button>
          </div>
        </div>
      </div>

      {showSearchLoading ? (
        <div className="space-y-6">
          <DispatchPreStorageGatePassCardSkeleton />
        </div>
      ) : isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageCheck />
            </EmptyMedia>

            <EmptyTitle>Could not load dispatch gate passes</EmptyTitle>

            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching nikasi gate passes.'}
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
      ) : nikasiGatePasses.length > 0 ? (
        <div className="space-y-6">
          {nikasiGatePasses.map((gatePass) => (
            <DispatchPreStorageGatePassCard key={gatePass._id} data={gatePass} />
          ))}
        </div>
      ) : (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageCheck />
            </EmptyMedia>

            <EmptyTitle>{emptyTitle}</EmptyTitle>

            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isSearchMode && !hasInvalidSearchInput ? (
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
      ) : null}
    </div>
  );
};

export default DaybookDispatchTab;
