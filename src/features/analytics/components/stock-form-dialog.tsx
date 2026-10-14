import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useStockFilters } from '@/features/settings/api/use-stock-filters';
import { useCreateColdStoreStock } from '@/features/analytics/api/use-create-cold-store-stock';
import { useDeleteColdStoreStock } from '@/features/analytics/api/use-delete-cold-store-stock';
import { useUpdateColdStoreStock } from '@/features/analytics/api/use-update-cold-store-stock';
import type { ColdStoreStockBody } from '@/features/analytics/api/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { BAG_SIZES, POTATO_VARIETIES } from '@/lib/constants';
import { getHttpStatusFromError } from '@/lib/http-error';

export type StockDraft = {
  stockId: string | null;
  variety: string;
  size: string;
  stockFilter: string;
  quantity: string;
};

const NONE_STOCK_FILTER = '__none__';

type StockFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: StockDraft | null;
};

type FieldErrors = {
  variety?: string;
  size?: string;
  quantity?: string;
};

function canonicalOption(current: string, options: readonly string[]): string {
  if (!current) return '';
  return options.find((option) => option.toLowerCase() === current.toLowerCase()) ?? current;
}

function optionsWithCurrent(current: string, options: readonly string[]): string[] {
  const canonical = canonicalOption(current, options);
  if (!canonical || options.some((option) => option === canonical)) return [...options];
  return [canonical, ...options];
}

function parseBagCount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function stockErrorMessage(error: unknown, fallback: string): string {
  if (getHttpStatusFromError(error) === 409) {
    return 'This variety and size is already in stock.';
  }
  return error instanceof Error ? error.message : fallback;
}

function filterSelectOptions(names: readonly string[], current: string): string[] {
  const sorted = [...names].sort((left, right) =>
    left.localeCompare(right, 'en-IN', { sensitivity: 'base' }),
  );
  return optionsWithCurrent(current, sorted);
}

function StockForm({
  draft,
  setDraft,
  errors,
  filterNames,
  isEditing,
  isSubmitting,
  isDeleting,
  onSubmit,
  onDelete,
}: {
  draft: StockDraft;
  setDraft: (draft: StockDraft) => void;
  errors: FieldErrors;
  filterNames: readonly string[];
  isEditing: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  const busy = isSubmitting || isDeleting;
  const varietyOptions = optionsWithCurrent(draft.variety, POTATO_VARIETIES);
  const sizeOptions = optionsWithCurrent(draft.size, BAG_SIZES);
  const stockFilterOptions = filterSelectOptions(filterNames, draft.stockFilter);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="stock-variety">Variety</FieldLabel>
          <Select
            value={canonicalOption(draft.variety, POTATO_VARIETIES) || undefined}
            onValueChange={(variety) => setDraft({ ...draft, variety })}
            disabled={busy}
          >
            <SelectTrigger
              id="stock-variety"
              className="h-11 w-full text-base"
              aria-invalid={errors.variety ? true : undefined}
            >
              <SelectValue placeholder="Select variety" />
            </SelectTrigger>
            <SelectContent>
              {varietyOptions.map((variety) => (
                <SelectItem key={variety} value={variety}>
                  {variety}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.variety ? <FieldError>{errors.variety}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="stock-size">Bag size</FieldLabel>
          <Select
            value={canonicalOption(draft.size, BAG_SIZES) || undefined}
            onValueChange={(size) => setDraft({ ...draft, size })}
            disabled={busy}
          >
            <SelectTrigger
              id="stock-size"
              className="h-11 w-full text-base"
              aria-invalid={errors.size ? true : undefined}
            >
              <SelectValue placeholder="Select bag size" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.size ? <FieldError>{errors.size}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="stock-filter">Stock filter</FieldLabel>
          <FieldDescription>Optional. None shows this row only under All.</FieldDescription>
          <Select
            value={canonicalOption(draft.stockFilter, stockFilterOptions) || NONE_STOCK_FILTER}
            onValueChange={(value) =>
              setDraft({
                ...draft,
                stockFilter: value === NONE_STOCK_FILTER ? '' : value,
              })
            }
            disabled={busy}
          >
            <SelectTrigger id="stock-filter" className="h-11 w-full text-base">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_STOCK_FILTER}>None</SelectItem>
              {stockFilterOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="stock-quantity">Quantity</FieldLabel>
          <Input
            id="stock-quantity"
            className="h-11 text-base tabular-nums"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={draft.quantity}
            aria-invalid={errors.quantity ? true : undefined}
            disabled={busy}
            onChange={(event) => setDraft({ ...draft, quantity: event.target.value })}
          />
          {errors.quantity ? <FieldError>{errors.quantity}</FieldError> : null}
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {isEditing ? (
          <Button
            type="button"
            variant="destructive"
            className="h-11 w-full sm:mr-auto sm:w-auto"
            disabled={busy}
            onClick={onDelete}
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Delete
          </Button>
        ) : null}
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={busy}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isEditing ? 'Save stock' : 'Add stock'}
        </Button>
      </div>
    </form>
  );
}

export function StockFormDialog({ open, onOpenChange, draft: initialDraft }: StockFormDialogProps) {
  const isMobile = useIsMobile();
  const { data: stockFilters = [] } = useStockFilters();
  const filterNames = stockFilters.map((option) => option.name);
  const { mutateAsync: createStock, isPending: isCreating } = useCreateColdStoreStock();
  const { mutateAsync: updateStock, isPending: isUpdating } = useUpdateColdStoreStock();
  const { mutateAsync: deleteStock, isPending: isDeleting } = useDeleteColdStoreStock();
  const [draft, setDraft] = useState<StockDraft | null>(initialDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initialDraft);
      setErrors({});
      setConfirmDelete(false);
    }
  }, [open, initialDraft]);

  const isEditing = Boolean(draft?.stockId);
  const isSubmitting = isCreating || isUpdating;

  const buildBody = (current: StockDraft): ColdStoreStockBody | null => {
    const nextErrors: FieldErrors = {};
    if (!current.variety) nextErrors.variety = 'Select a variety.';
    if (!current.size) nextErrors.size = 'Select a bag size.';

    const quantity = parseBagCount(current.quantity);
    if (quantity === null) nextErrors.quantity = 'Enter a whole number of bags.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || quantity === null) {
      return null;
    }

    const stockFilter = current.stockFilter.trim();
    return {
      variety: canonicalOption(current.variety, POTATO_VARIETIES),
      ...(current.stockId || stockFilter ? { stockFilter } : {}),
      size: {
        name: canonicalOption(current.size, BAG_SIZES),
        currentQuantity: quantity,
        initialQuantity: quantity,
      },
    };
  };

  const handleSubmit = () => {
    if (!draft) return;
    const body = buildBody(draft);
    if (!body) return;

    const request = draft.stockId ? updateStock({ id: draft.stockId, body }) : createStock(body);

    void request
      .then((response) => {
        toast.success(response.message ?? (draft.stockId ? 'Stock updated' : 'Stock added'), {
          position: 'bottom-right',
        });
        onOpenChange(false);
      })
      .catch((error: unknown) => {
        toast.error(
          stockErrorMessage(
            error,
            draft.stockId ? 'Failed to update stock' : 'Failed to add stock',
          ),
          { position: 'bottom-right' },
        );
      });
  };

  const handleDelete = () => {
    if (!draft?.stockId) return;

    void deleteStock(draft.stockId)
      .then((response) => {
        toast.success(response.message ?? 'Stock deleted', { position: 'bottom-right' });
        setConfirmDelete(false);
        onOpenChange(false);
      })
      .catch((error: unknown) => {
        toast.error(stockErrorMessage(error, 'Failed to delete stock'), {
          position: 'bottom-right',
        });
      });
  };

  if (!draft) return null;

  const title = isEditing ? 'Edit stock' : 'Add stock';
  const description = 'One row is stored for each variety and bag size.';
  const form = (
    <StockForm
      draft={draft}
      setDraft={setDraft}
      errors={errors}
      filterNames={filterNames}
      isEditing={isEditing}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      onSubmit={handleSubmit}
      onDelete={() => setConfirmDelete(true)}
    />
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="bottom"
            className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-2">{form}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-h-[min(90dvh,44rem)] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>
              Delete {draft.variety || 'this variety'}
              {draft.size ? ` · ${draft.size}` : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the stock row from the cold storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep stock</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
