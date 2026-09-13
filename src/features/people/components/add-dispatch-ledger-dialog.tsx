import { useForm } from '@tanstack/react-form';
import { Loader2, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
import { useCreateDispatchLedger } from '@/features/people/api/use-create-dispatch-ledger';
import {
  addDispatchLedgerFormSchema,
  buildAddDispatchLedgerPayload,
  type AddDispatchLedgerFormInput,
} from '@/features/people/schemas/add-dispatch-ledger-form-schema';
import type { DispatchLedger } from '@/features/people/types';

type AddDispatchLedgerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (ledger: DispatchLedger) => void;
};

type FieldMetaForDisplay = {
  isBlurred: boolean;
  isValid: boolean;
  errors: unknown[];
};

function createDefaultValues(): AddDispatchLedgerFormInput {
  return {
    name: '',
    address: '',
    mobileNumber: '',
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

function OptionalFieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="flex flex-wrap items-center gap-2">
      {children}
      <Badge variant="secondary" className="text-xs font-normal">
        Optional
      </Badge>
    </FieldLabel>
  );
}

export function AddDispatchLedgerDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDispatchLedgerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddDispatchLedgerDialogContent onOpenChange={onOpenChange} onSuccess={onSuccess} />
      ) : null}
    </Dialog>
  );
}

type AddDispatchLedgerDialogContentProps = {
  onOpenChange: (open: boolean) => void;
  onSuccess?: (ledger: DispatchLedger) => void;
};

function AddDispatchLedgerDialogContent({
  onOpenChange,
  onSuccess,
}: AddDispatchLedgerDialogContentProps) {
  const { mutateAsync: createDispatchLedger, isPending } = useCreateDispatchLedger();

  const form = useForm({
    defaultValues: createDefaultValues(),
    validators: {
      onSubmit: addDispatchLedgerFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = buildAddDispatchLedgerPayload(addDispatchLedgerFormSchema.parse(value));
        const { message, data } = await createDispatchLedger(payload);

        toast.success(message ?? 'Dispatch ledger added successfully', {
          position: 'bottom-right',
        });

        if (data) {
          onSuccess?.(data);
        }

        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add dispatch ledger', {
          position: 'bottom-right',
        });
      }
    },
  });

  return (
    <DialogContent className="flex max-h-[min(90dvh,620px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Add dispatch ledger
        </DialogTitle>
        <DialogDescription>
          Create a dispatch ledger for the current cold storage. Fields marked with{' '}
          <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="add-dispatch-ledger-form"
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
                      placeholder="Ramesh Kumar"
                      autoComplete="name"
                      className="h-11 text-base"
                    />
                    <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="address">
              {(field) => {
                const isInvalid = shouldShowFieldErrors(
                  field.state.meta,
                  field.form.state.submissionAttempts,
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <RequiredFieldLabel htmlFor={field.name}>Address</RequiredFieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Village Road, Ludhiana, Punjab"
                      autoComplete="street-address"
                      maxLength={500}
                      className="h-11 text-base"
                    />
                    <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="mobileNumber">
              {(field) => {
                const isInvalid = shouldShowFieldErrors(
                  field.state.meta,
                  field.form.state.submissionAttempts,
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <OptionalFieldLabel htmlFor={field.name}>Mobile number</OptionalFieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      aria-invalid={isInvalid}
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                      className="h-11 text-base tabular-nums"
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
                form="add-dispatch-ledger-form"
                disabled={!canSubmit || isPending}
                className="h-11 sm:h-10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Save dispatch ledger
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
