import { useForm } from '@tanstack/react-form';
import { Loader2, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { StockFilterOption } from '@/features/settings/api/stock-filter-types';
import { useCreateStockFilter } from '@/features/settings/api/use-create-stock-filter';
import { useUpdateStockFilter } from '@/features/settings/api/use-update-stock-filter';
import { stockFilterErrorMessage } from '@/features/settings/lib/stock-filter-error';
import {
  type StockFilterFormInput,
  stockFilterFormSchema,
} from '@/features/settings/schemas/stock-filter-form-schema';

type StockFilterFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  stockFilter?: StockFilterOption | null;
  onOpenChange: (open: boolean) => void;
};

type FieldMetaForDisplay = {
  isBlurred: boolean;
  isValid: boolean;
  errors: unknown[];
};

function createDefaultValues(stockFilter?: StockFilterOption | null): StockFilterFormInput {
  return {
    name: stockFilter?.name ?? '',
  };
}

function shouldShowFieldErrors(meta: FieldMetaForDisplay, submissionAttempts: number) {
  return (submissionAttempts > 0 || meta.isBlurred) && !meta.isValid && meta.errors.length > 0;
}

function FieldErrorSlot({
  show,
  errors,
}: {
  show: boolean;
  errors?: Array<{ message?: string } | undefined>;
}) {
  return (
    <div className="min-h-5" aria-live="polite">
      {show ? <FieldError errors={errors} /> : null}
    </div>
  );
}

function RequiredFieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="gap-1">
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </FieldLabel>
  );
}

export function StockFilterFormDialog({
  open,
  mode,
  stockFilter,
  onOpenChange,
}: StockFilterFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <StockFilterFormDialogContent
          mode={mode}
          stockFilter={stockFilter}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

type StockFilterFormDialogContentProps = {
  mode: 'create' | 'edit';
  stockFilter?: StockFilterOption | null;
  onOpenChange: (open: boolean) => void;
};

function StockFilterFormDialogContent({
  mode,
  stockFilter,
  onOpenChange,
}: StockFilterFormDialogContentProps) {
  const { mutateAsync: createStockFilter, isPending: isCreating } = useCreateStockFilter();
  const { mutateAsync: updateStockFilter, isPending: isUpdating } = useUpdateStockFilter();
  const isPending = isCreating || isUpdating;
  const isEdit = mode === 'edit';

  const form = useForm({
    defaultValues: createDefaultValues(stockFilter),
    validators: {
      onSubmit: stockFilterFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { name } = stockFilterFormSchema.parse(value);

        if (isEdit) {
          if (!stockFilter) return;

          const { message } = await updateStockFilter({
            id: stockFilter._id,
            body: { name },
          });

          toast.success(message ?? 'Stock filter updated', { position: 'bottom-right' });
        } else {
          const { message } = await createStockFilter({ name });

          toast.success(message ?? 'Stock filter created', { position: 'bottom-right' });
        }

        onOpenChange(false);
      } catch (error) {
        toast.error(
          stockFilterErrorMessage(
            error,
            isEdit ? 'Failed to update stock filter' : 'Failed to create stock filter',
          ),
          { position: 'bottom-right' },
        );
      }
    },
  });

  return (
    <DialogContent className="flex max-h-[min(90dvh,520px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {isEdit ? 'Rename stock filter' : 'New stock filter'}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the name. Names must be unique for this cold storage. Stock rows already using the previous name are left as they are.'
            : 'Create a stock filter for this cold storage. Names must be unique.'}{' '}
          Fields marked with <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="stock-filter-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FieldGroup className="gap-4">
            <form.Field name="name">
              {(field) => {
                const isInvalid = shouldShowFieldErrors(
                  field.state.meta,
                  field.form.state.submissionAttempts,
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <RequiredFieldLabel htmlFor={field.name}>Name</RequiredFieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="OWNED"
                      autoComplete="off"
                      maxLength={120}
                      className="h-11 text-base"
                    />
                    <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-10"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                type="submit"
                form="stock-filter-form"
                disabled={!canSubmit || isPending}
                className="h-11 sm:h-10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : isEdit ? (
                  'Save name'
                ) : (
                  <>
                    <Plus className="size-4" />
                    Create stock filter
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
