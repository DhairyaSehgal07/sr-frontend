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
import type { BillBook } from '@/features/settings/api/types';
import { useCreateBillBook } from '@/features/settings/api/use-create-bill-book';
import { useUpdateBillBook } from '@/features/settings/api/use-update-bill-book';
import {
  type BillBookFormInput,
  billBookFormSchema,
} from '@/features/settings/schemas/bill-book-form-schema';

type BillBookFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  billBook?: BillBook | null;
  onOpenChange: (open: boolean) => void;
};

type FieldMetaForDisplay = {
  isBlurred: boolean;
  isValid: boolean;
  errors: unknown[];
};

function createDefaultValues(billBook?: BillBook | null): BillBookFormInput {
  return {
    name: billBook?.name ?? '',
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

export function BillBookFormDialog({
  open,
  mode,
  billBook,
  onOpenChange,
}: BillBookFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BillBookFormDialogContent mode={mode} billBook={billBook} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

type BillBookFormDialogContentProps = {
  mode: 'create' | 'edit';
  billBook?: BillBook | null;
  onOpenChange: (open: boolean) => void;
};

function BillBookFormDialogContent({
  mode,
  billBook,
  onOpenChange,
}: BillBookFormDialogContentProps) {
  const { mutateAsync: createBillBook, isPending: isCreating } = useCreateBillBook();
  const { mutateAsync: updateBillBook, isPending: isUpdating } = useUpdateBillBook();
  const isPending = isCreating || isUpdating;
  const isEdit = mode === 'edit';

  const form = useForm({
    defaultValues: createDefaultValues(billBook),
    validators: {
      onSubmit: billBookFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { name } = billBookFormSchema.parse(value);

        if (isEdit) {
          if (!billBook) return;

          const { message } = await updateBillBook({
            id: billBook._id,
            body: { name },
          });

          toast.success(message ?? 'Bill book updated successfully', {
            position: 'bottom-right',
          });
        } else {
          const { message } = await createBillBook({ name });

          toast.success(message ?? 'Bill book created successfully', {
            position: 'bottom-right',
          });
        }

        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : isEdit
              ? 'Failed to update bill book'
              : 'Failed to create bill book',
          { position: 'bottom-right' },
        );
      }
    },
  });

  return (
    <DialogContent className="flex max-h-[min(90dvh,520px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {isEdit ? 'Rename bill book' : 'New bill book'}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the name for this bill book. Names must be unique for this cold storage.'
            : 'Create an active bill book for this cold storage. Names must be unique.'}{' '}
          Fields marked with <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="bill-book-form"
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
                      placeholder="2026 Season A"
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
                form="bill-book-form"
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
                    Create bill book
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
