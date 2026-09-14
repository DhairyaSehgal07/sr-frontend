import { BookCopy, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BillBook, BillBookListParams } from '@/features/settings/api/types';
import { useBillBooks } from '@/features/settings/api/use-bill-books';
import { useUpdateBillBook } from '@/features/settings/api/use-update-bill-book';
import { ArchiveBillBookDialog } from '@/features/settings/components/archive-bill-book-dialog';
import { BillBookFormDialog } from '@/features/settings/components/bill-book-form-dialog';
import { BillBooksTable } from '@/features/settings/components/bill-books-table';

const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = 'all' | 'active' | 'archived';

function toListParams(search: string, status: StatusFilter): BillBookListParams {
  const trimmed = search.trim();
  const params: BillBookListParams = {};

  if (trimmed) params.search = trimmed;
  if (status === 'active') params.isActive = 'true';
  if (status === 'archived') params.isActive = 'false';

  return params;
}

export function BillBooksPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', SEARCH_DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BillBook | null>(null);
  const [archivingBook, setArchivingBook] = useState<BillBook | null>(null);

  const listParams = useMemo(
    () => toListParams(debouncedSearch, statusFilter),
    [debouncedSearch, statusFilter],
  );

  const { data = [], error, isError, isFetching, isLoading, refetch } = useBillBooks(listParams);
  const { mutateAsync: updateBillBook, isPending: isRestoring } = useUpdateBillBook();

  const hasFilters = Boolean(listParams.search);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setDebouncedSearch(value);
  };

  const handleEdit = useCallback((billBook: BillBook) => {
    setEditingBook(billBook);
  }, []);

  const handleArchive = useCallback((billBook: BillBook) => {
    setArchivingBook(billBook);
  }, []);

  const handleRestore = useCallback(
    async (billBook: BillBook) => {
      try {
        const { message } = await updateBillBook({
          id: billBook._id,
          body: { isActive: true },
        });

        toast.success(message ?? 'Bill book restored', { position: 'bottom-right' });
      } catch (mutationError) {
        toast.error(
          mutationError instanceof Error ? mutationError.message : 'Failed to restore bill book',
          { position: 'bottom-right' },
        );
      }
    },
    [updateBillBook],
  );

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const countLabel =
    data.length === 1 ? '1 bill book' : `${data.length.toLocaleString('en-IN')} bill books`;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Manage Bill Books
        </h1>
        <p className="text-sm text-muted-foreground">
          Create and archive bill books used on gate passes. Names must be unique for this cold
          storage.
        </p>
      </div>

      <Item variant="outline" size="sm" className="rounded-xl bg-card shadow-sm">
        <ItemMedia variant="icon" className="size-10 rounded-xl bg-primary/10 text-primary">
          <BookCopy className="size-5" aria-hidden="true" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="text-base font-semibold text-foreground">
            {isLoading ? 'Loading bill books' : countLabel}
          </ItemTitle>
          <ItemDescription>
            {statusFilter === 'active'
              ? 'Showing active books'
              : statusFilter === 'archived'
                ? 'Showing archived books'
                : 'Showing all books'}
            {listParams.search ? ` matching "${listParams.search}"` : ''}.
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
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
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
              aria-label="Search bill books by name"
            />
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <TabsList aria-label="Filter by status">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button type="button" className="h-11 w-full sm:h-10 sm:w-fit" onClick={handleCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New bill book
        </Button>
      </div>

      <BillBooksTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        hasFilters={hasFilters}
        onRetry={() => void refetch()}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onRestore={(billBook) => {
          if (isRestoring) return;
          void handleRestore(billBook);
        }}
      />

      <BillBookFormDialog open={createOpen} mode="create" onOpenChange={setCreateOpen} />

      <BillBookFormDialog
        open={editingBook != null}
        mode="edit"
        billBook={editingBook}
        onOpenChange={(open) => {
          if (!open) setEditingBook(null);
        }}
      />

      <ArchiveBillBookDialog
        billBook={archivingBook}
        open={archivingBook != null}
        onOpenChange={(open) => {
          if (!open) setArchivingBook(null);
        }}
      />
    </main>
  );
}
