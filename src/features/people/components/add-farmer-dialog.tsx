import { useForm } from '@tanstack/react-form';
import { Info, Loader2, UserPlus } from 'lucide-react';
import { useMemo } from 'react';
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuickRegisterFarmer } from '@/features/people/api/use-quick-register-farmer';
import {
  buildAddFarmerPayload,
  createAddFarmerFormSchema,
  type AddFarmerFormInput,
} from '@/features/people/schemas/add-farmer-form-schema';
import type { FarmerStorageLink } from '@/features/people/types';
import {
  getNextAccountNumber,
  getUsedAccountNumbers,
  getUsedMobileNumbers,
} from '@/features/people/utils/farmer-account-numbers';
import {
  blurTargetOnNumberWheel,
  businessNumberSpinnerClassName,
  preventArrowUpDownOnNumericInput,
} from '@/lib/business-number-input';
import { cn } from '@/lib/utils';

type AddFarmerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links?: FarmerStorageLink[];
  onSuccess?: (link: FarmerStorageLink) => void;
};

function createDefaultValues(nextAccountNumber: number): AddFarmerFormInput {
  return {
    name: '',
    address: '',
    mobileNumber: '',
    accountNumber: nextAccountNumber.toString(),
    aadharCardNumber: '',
    panCardNumber: '',
    imageUrl: '',
    costPerBag: undefined,
  };
}

type FieldMetaForDisplay = {
  isBlurred: boolean;
  isValid: boolean;
  errors: unknown[];
};

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

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatOptionalNumberDisplay(value: number | undefined): string {
  return value == null ? '' : String(value);
}

const costPerBagNumericProps = {
  type: 'number' as const,
  min: 0,
  onWheel: blurTargetOnNumberWheel,
};

function RequiredFieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="gap-1">
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </FieldLabel>
  );
}

function OptionalFieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="flex flex-wrap items-center gap-2">
      {children}
      <Badge variant="secondary" className="text-xs font-normal">
        Optional
      </Badge>
    </FieldLabel>
  );
}

export function AddFarmerDialog({
  open,
  onOpenChange,
  links = [],
  onSuccess,
}: AddFarmerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddFarmerDialogContent links={links} onSuccess={onSuccess} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

type AddFarmerDialogContentProps = {
  links: FarmerStorageLink[];
  onOpenChange: (open: boolean) => void;
  onSuccess?: (link: FarmerStorageLink) => void;
};

function AddFarmerDialogContent({ links, onOpenChange, onSuccess }: AddFarmerDialogContentProps) {
  const usedAccountNumbers = useMemo(() => getUsedAccountNumbers(links), [links]);
  const nextAccountNumber = useMemo(
    () => getNextAccountNumber(usedAccountNumbers),
    [usedAccountNumbers],
  );

  const { mutateAsync: quickRegisterFarmer, isPending } = useQuickRegisterFarmer();

  const formSchema = useMemo(
    () =>
      createAddFarmerFormSchema({
        getUsedAccountNumbers: () => getUsedAccountNumbers(links),
        getUsedMobileNumbers: () => getUsedMobileNumbers(links),
      }),
    [links],
  );

  const form = useForm({
    defaultValues: createDefaultValues(nextAccountNumber),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = buildAddFarmerPayload(formSchema.parse(value));
        const { message, data } = await quickRegisterFarmer(payload);
        toast.success(message ?? 'Farmer added successfully', {
          position: 'bottom-right',
        });
        if (data) {
          onSuccess?.(data);
        }
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add farmer', {
          position: 'bottom-right',
        });
      }
    },
  });

  return (
    <DialogContent className="flex max-h-[min(90dvh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
        <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Add farmer
        </DialogTitle>
        <DialogDescription>
          Create a farmer account linked to your cold storage. Fields marked with{' '}
          <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="add-farmer-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FieldGroup className="gap-8">
            <FieldGroup className="gap-4">
              <form.Field name="accountNumber">
                {(field) => {
                  const isInvalid = shouldShowFieldErrors(
                    field.state.meta,
                    field.form.state.submissionAttempts,
                  );
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center justify-between gap-2">
                        <RequiredFieldLabel htmlFor={field.name}>Account number</RequiredFieldLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label="View used account numbers"
                            >
                              <Info className="size-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-sm">
                            {usedAccountNumbers.length > 0 ? (
                              <span>
                                Used account numbers:{' '}
                                <span className="tabular-nums">
                                  {usedAccountNumbers.join(', ')}
                                </span>
                              </span>
                            ) : (
                              'No account numbers in use yet.'
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={`Suggested: ${nextAccountNumber}`}
                            inputMode="numeric"
                            min={1}
                            className={cn(
                              'h-11 flex-1 text-base tabular-nums',
                              businessNumberSpinnerClassName,
                            )}
                            onWheel={blurTargetOnNumberWheel}
                            onKeyDown={preventArrowUpDownOnNumericInput}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 shrink-0 sm:h-11"
                            onClick={() =>
                              form.setFieldValue('accountNumber', nextAccountNumber.toString())
                            }
                          >
                            Use suggested (<span className="tabular-nums">{nextAccountNumber}</span>
                            )
                          </Button>
                        </div>
                        <FieldDescription>
                          Enter any positive number. Duplicate values are not allowed.
                        </FieldDescription>
                      </div>

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
                      <RequiredFieldLabel htmlFor={field.name}>Mobile number</RequiredFieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        aria-invalid={isInvalid}
                        placeholder="Enter 10-digit mobile number"
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
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter farmer name"
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
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter address"
                        autoComplete="street-address"
                        className="h-11 text-base"
                      />
                      <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <FieldSeparator>Optional</FieldSeparator>

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold text-foreground">
                Additional details
              </FieldLegend>
              <FieldDescription>
                KYC, billing, and profile information — leave blank if not available yet.
              </FieldDescription>

              <FieldGroup className="mt-5 gap-4">
                <form.Field name="aadharCardNumber">
                  {(field) => {
                    const isInvalid = shouldShowFieldErrors(
                      field.state.meta,
                      field.form.state.submissionAttempts,
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <OptionalFieldLabel htmlFor={field.name}>Aadhaar number</OptionalFieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 12))
                          }
                          aria-invalid={isInvalid}
                          placeholder="123456789012"
                          inputMode="numeric"
                          maxLength={12}
                          className="h-11 text-base tabular-nums"
                        />
                        <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="panCardNumber">
                  {(field) => {
                    const isInvalid = shouldShowFieldErrors(
                      field.state.meta,
                      field.form.state.submissionAttempts,
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <OptionalFieldLabel htmlFor={field.name}>PAN</OptionalFieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value.toUpperCase().slice(0, 10))
                          }
                          aria-invalid={isInvalid}
                          placeholder="ABCDE1234F"
                          autoComplete="off"
                          className="h-11 text-base uppercase"
                        />
                        <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="costPerBag">
                  {(field) => {
                    const isInvalid = shouldShowFieldErrors(
                      field.state.meta,
                      field.form.state.submissionAttempts,
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <OptionalFieldLabel htmlFor={field.name}>Cost per bag</OptionalFieldLabel>
                        <Input
                          {...costPerBagNumericProps}
                          id={field.name}
                          name={field.name}
                          value={formatOptionalNumberDisplay(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseOptionalPositiveNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="25"
                          inputMode="decimal"
                          className={cn(
                            'h-11 text-base tabular-nums',
                            businessNumberSpinnerClassName,
                          )}
                          onKeyDown={preventArrowUpDownOnNumericInput}
                        />
                        <FieldDescription>
                          Storage rate in INR per bag, if applicable.
                        </FieldDescription>
                        <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="imageUrl">
                  {(field) => {
                    const isInvalid = shouldShowFieldErrors(
                      field.state.meta,
                      field.form.state.submissionAttempts,
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <OptionalFieldLabel htmlFor={field.name}>
                          Profile image URL
                        </OptionalFieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="https://example.com/farmer.jpg"
                          type="url"
                          inputMode="url"
                          autoComplete="off"
                          className="h-11 text-base"
                        />
                        <FieldErrorSlot show={isInvalid} errors={field.state.meta.errors} />
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
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
                form="add-farmer-form"
                disabled={!canSubmit || isPending}
                className="h-11 sm:h-10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Save farmer
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
