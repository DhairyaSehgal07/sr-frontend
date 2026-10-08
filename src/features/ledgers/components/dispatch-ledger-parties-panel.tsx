import { useMemo, useState } from 'react';
import { BookOpen, Loader2, Plus, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

import { useDispatchLedgers } from '../api/use-dispatch-ledgers';
import type { DispatchLedger } from '../types';
import { AddDispatchLedgerDialog } from './add-dispatch-ledger-dialog';
import { DispatchLedgerCard, DispatchLedgerCardSkeleton } from './dispatch-ledger-card';

type SortOrder = 'newest' | 'oldest';

function getDispatchLedgerCreatedAt(ledger: DispatchLedger): number {
  const createdAt = ledger.createdAt;
  if (!createdAt) return 0;

  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function filterAndSortDispatchLedgers(
  ledgers: DispatchLedger[],
  search: string,
  sortOrder: SortOrder,
): DispatchLedger[] {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = normalizedSearch
    ? ledgers.filter((ledger) => {
        const mobileNumber = ledger.mobileNumber ?? '';
        return (
          ledger.name.toLowerCase().includes(normalizedSearch) ||
          ledger.address.toLowerCase().includes(normalizedSearch) ||
          mobileNumber.includes(normalizedSearch)
        );
      })
    : ledgers;

  return [...filtered].sort((a, b) => {
    const diff = getDispatchLedgerCreatedAt(b) - getDispatchLedgerCreatedAt(a);
    return sortOrder === 'newest' ? diff : -diff;
  });
}

export function DispatchLedgerPartiesPanel() {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [addDispatchLedgerOpen, setAddDispatchLedgerOpen] = useState(false);

  const {
    data: dispatchLedgers = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDispatchLedgers();

  const visibleDispatchLedgers = useMemo(
    () => filterAndSortDispatchLedgers(dispatchLedgers, search, sortOrder),
    [dispatchLedgers, search, sortOrder],
  );

  const hasSearch = search.trim().length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <DispatchLedgerCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, address, or mobile"
            className="w-full pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={() => setAddDispatchLedgerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add party
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>Could not load dispatch parties</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching dispatch parties.'}
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
      ) : visibleDispatchLedgers.length === 0 ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>
              {hasSearch ? 'No matching dispatch parties' : 'No dispatch parties yet'}
            </EmptyTitle>
            <EmptyDescription>
              {hasSearch
                ? 'Try a different name, address, or mobile number.'
                : 'Add dispatch parties used on nikasi gate passes.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleDispatchLedgers.map((ledger) => (
            <DispatchLedgerCard key={ledger._id} ledger={ledger} />
          ))}
        </div>
      )}

      <AddDispatchLedgerDialog
        open={addDispatchLedgerOpen}
        onOpenChange={setAddDispatchLedgerOpen}
      />
    </div>
  );
}

// Local skeleton import to avoid circular deps
import { Skeleton } from '@/components/ui/skeleton';
