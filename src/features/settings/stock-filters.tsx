import { Loader2, Plus, RefreshCw, Search, Tags } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import type { StockFilterOption } from '@/features/settings/api/stock-filter-types';
import { useStockFilters } from '@/features/settings/api/use-stock-filters';

import { DeleteStockFilterDialog } from './components/delete-stock-filter-dialog';
import { StockFilterFormDialog } from './components/stock-filter-form-dialog';
import { StockFiltersTable } from './components/stock-filters-table';

const SEARCH_DEBOUNCE_MS = 300;

export function StockFiltersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', SEARCH_DEBOUNCE_MS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<StockFilterOption | null>(null);
  const [deletingFilter, setDeletingFilter] = useState<StockFilterOption | null>(null);

  const { data = [], error, isError, isFetching, isLoading, refetch } = useStockFilters();

  const query = debouncedSearch.trim().toLowerCase();
  const visibleFilters = useMemo(() => {
    if (!query) return data;
    return data.filter((item) => item.name.toLowerCase().includes(query));
  }, [data, query]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setDebouncedSearch(value);
  };

  const handleEdit = useCallback((stockFilter: StockFilterOption) => {
    setEditingFilter(stockFilter);
  }, []);

  const handleDelete = useCallback((stockFilter: StockFilterOption) => {
    setDeletingFilter(stockFilter);
  }, []);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const countLabel =
    data.length === 1 ? '1 stock filter' : `${data.length.toLocaleString('en-IN')} stock filters`;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Manage Stock Filters
        </h1>
        <p className="text-sm text-muted-foreground">
          Create names used to group stock on Analytics. Names must be unique for this cold storage.
        </p>
      </div>

      <Item variant="outline" size="sm" className="rounded-xl bg-card shadow-sm">
        <ItemMedia variant="icon" className="size-10 rounded-xl bg-primary/10 text-primary">
          <Tags className="size-5" aria-hidden="true" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="text-base font-semibold text-foreground">
            {isLoading ? 'Loading stock filters' : countLabel}
          </ItemTitle>
          <ItemDescription>
            {query
              ? `Showing filters matching "${debouncedSearch.trim()}".`
              : 'Showing all filters.'}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name…"
            className="h-11 pl-9 text-base sm:h-10 sm:text-sm"
            aria-label="Search stock filters by name"
          />
        </div>

        <Button type="button" className="h-11 w-full sm:h-10 sm:w-fit" onClick={handleCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New stock filter
        </Button>
      </div>

      <StockFiltersTable
        data={visibleFilters}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        hasFilters={Boolean(query)}
        onRetry={() => void refetch()}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StockFilterFormDialog open={createOpen} mode="create" onOpenChange={setCreateOpen} />

      <StockFilterFormDialog
        open={editingFilter != null}
        mode="edit"
        stockFilter={editingFilter}
        onOpenChange={(open) => {
          if (!open) setEditingFilter(null);
        }}
      />

      <DeleteStockFilterDialog
        stockFilter={deletingFilter}
        open={deletingFilter != null}
        onOpenChange={(open) => {
          if (!open) setDeletingFilter(null);
        }}
      />
    </main>
  );
}
