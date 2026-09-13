import { useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCw, Search, Users } from 'lucide-react';

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import { useFarmerStorageLinks } from '../api/use-farmer-storage-links';
import { AddFarmerDialog } from './add-farmer-dialog';
import { PeopleCard, PeopleCardSkeleton } from './people-card';
import type { FarmerStorageLink } from '../types';

type SortOrder = 'newest' | 'oldest';

function getFarmerCreatedAt(link: FarmerStorageLink): number {
  const createdAt = link.farmerId.createdAt;
  if (!createdAt) return 0;

  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function filterAndSortPeople(
  links: FarmerStorageLink[],
  search: string,
  sortOrder: SortOrder,
): FarmerStorageLink[] {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = normalizedSearch
    ? links.filter((link) => link.farmerId.name.toLowerCase().includes(normalizedSearch))
    : links;

  return [...filtered].sort((a, b) => {
    const diff = getFarmerCreatedAt(b) - getFarmerCreatedAt(a);
    return sortOrder === 'newest' ? diff : -diff;
  });
}

function PeopleTabSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>

        <ItemContent>
          <Skeleton className="h-5 w-32" />
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
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PeopleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

const PeopleTab = () => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);

  const {
    data: farmerStorageLinks = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useFarmerStorageLinks();

  const visiblePeople = useMemo(
    () => filterAndSortPeople(farmerStorageLinks, search, sortOrder),
    [farmerStorageLinks, search, sortOrder],
  );

  const peopleCount = farmerStorageLinks.length;
  const hasSearch = search.trim().length > 0;

  if (isLoading) {
    return <PeopleTabSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{peopleCount} people</ItemTitle>
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
            placeholder="Search by name"
            className="w-full pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
              <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:shrink-0">
            <Button variant="secondary" className="min-w-0 px-2.5 sm:px-3">
              <span className="truncate sm:hidden">Edit History</span>
              <span className="hidden sm:inline">People Edit History</span>
            </Button>

            <Button className="min-w-0 px-2.5 sm:px-3" onClick={() => setAddFarmerOpen(true)}>
              <Plus className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Farmer</span>
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>

            <EmptyTitle>Could not load people</EmptyTitle>

            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching people.'}
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
      ) : visiblePeople.length === 0 ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>

            <EmptyTitle>{hasSearch ? 'No matching people' : 'No people yet'}</EmptyTitle>

            <EmptyDescription>
              {hasSearch
                ? 'Try a different name or clear the search.'
                : 'Farmer accounts linked to your cold storage will appear here.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePeople.map((link) => (
            <PeopleCard key={link._id} link={link} />
          ))}
        </div>
      )}

      <AddFarmerDialog
        open={addFarmerOpen}
        onOpenChange={setAddFarmerOpen}
        links={farmerStorageLinks}
      />
    </div>
  );
};

export default PeopleTab;
