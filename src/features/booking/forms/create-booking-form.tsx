import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/date-picker';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { useCreateBooking } from '@/features/booking/api/use-create-booking';
import { BookingQuantitiesSection } from '@/features/booking/forms/booking-quantities-section';
import { BookingSummarySheet } from '@/features/booking/forms/booking-summary-sheet';
import { useCreateBookingForm } from '@/features/booking/forms/use-create-booking-form';
import { useBookingAvailability } from '@/features/booking/hooks/use-booking-availability';
import {
  createBookingFormSchema,
  createDefaultBookingQuantities,
} from '@/features/booking/schemas/booking-form-schema';
import { useDispatchLedgers } from '@/features/people/api/use-dispatch-ledgers';
import { AddDispatchLedgerDialog } from '@/features/people/components/add-dispatch-ledger-dialog';
import type { DispatchLedger } from '@/features/people/types';
import { useGetReceiptVoucherNumber, voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const CreateBookingForm = () => {
  const { data: dispatchLedgers = [] } = useDispatchLedgers();
  const {
    data: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useGetReceiptVoucherNumber('booking-gate-pass');
  const { mutateAsync: createBooking } = useCreateBooking();
  const {
    availabilityMap,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    isReady: isAvailabilityReady,
  } = useBookingAvailability();

  const availabilityContext = useMemo(
    () => ({
      availabilityMap,
      validateAvailability: isAvailabilityReady,
    }),
    [availabilityMap, isAvailabilityReady],
  );

  const formSchema = useMemo(
    () => createBookingFormSchema(availabilityContext),
    [availabilityContext],
  );

  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerComboboxOpen, setLedgerComboboxOpen] = useState(false);
  const [addLedgerOpen, setAddLedgerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const resetComboboxState = () => {
    setLedgerSearch('');
    setLedgerComboboxOpen(false);
  };

  const { form } = useCreateBookingForm({
    availability: availabilityContext,
    onOpenReview: () => setReviewOpen(true),
    onCreate: async (parsed) => {
      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail('booking-gate-pass'),
      );

      if (gatePassNo == null) {
        toast.error('Gate pass number is unavailable. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      try {
        const { message } = await createBooking({
          form: parsed,
          gatePassNo,
        });

        toast.success(message ?? 'Booking gate pass created', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        form.setFieldValue('quantities', createDefaultBookingQuantities());
        resetComboboxState();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create booking gate pass', {
          position: 'bottom-right',
        });
      }
    },
  });

  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(
    () =>
      dispatchLedgers.map((ledger) => ({
        id: ledger._id,
        label: ledger.name,
      })),
    [dispatchLedgers],
  );

  const sortedLedgers = useMemo(
    () => filterAndSortOptions(ledgerSearch, dispatchLedgerOptions),
    [ledgerSearch, dispatchLedgerOptions],
  );
  const getDispatchLedgerLabel = (dispatchLedgerId: string) =>
    dispatchLedgers.find((ledger) => ledger._id === dispatchLedgerId)?.name ?? '';

  const handleLedgerCreated = (ledger: DispatchLedger) => {
    form.setFieldValue('dispatchLedgerId', ledger._id);
    setLedgerSearch(ledger.name);
    setLedgerComboboxOpen(false);
  };

  const handleReset = () => {
    form.reset();
    form.setFieldValue('quantities', createDefaultBookingQuantities());
    resetComboboxState();
  };

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const isGatePassNumberReady =
    !isLoadingVoucherNumber && !isVoucherNumberError && nextVoucherNumber != null;

  const displayGatePassNo = isLoadingVoucherNumber
    ? '…'
    : isVoucherNumberError || nextVoucherNumber == null
      ? '—'
      : `#${nextVoucherNumber}`;

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Booking Gate Pass{' '}
          <span className="font-mono tabular-nums text-primary sm:text-2xl">
            {displayGatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Record dispatch ledger and bag quantities for a new booking gate pass.
        </CardDescription>
      </CardHeader>

      <form id="create-booking-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pb-8 pt-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Booking Details
              </FieldLegend>
              <FieldDescription>Gate pass reference, date, and dispatch ledger.</FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="manualGatePassNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Manual Gate Pass No.</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseOptionalPositiveNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024 (optional)"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="date">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id={field.name}
                          label="Date"
                          value={field.state.value ? new Date(field.state.value) : undefined}
                          onChange={(date) => field.handleChange(date ? date.toISOString() : '')}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="Pick a date"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="dispatchLedgerId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor="create-booking-ledger">Dispatch Ledger</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="create-booking-ledger"
                              name={field.name}
                              value={field.state.value}
                              onValueChange={field.handleChange}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              placeholder="Search ledgers..."
                              emptyMessage="No ledgers found."
                              options={dispatchLedgerOptions}
                              sortedOptions={sortedLedgers}
                              search={ledgerSearch}
                              setSearch={setLedgerSearch}
                              open={ledgerComboboxOpen}
                              setOpen={setLedgerComboboxOpen}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                            onClick={() => setAddLedgerOpen(true)}
                            aria-label="Add ledger"
                          >
                            <UserPlus className="size-4 shrink-0" />
                            <span className="hidden sm:inline">Add Ledger</span>
                          </Button>
                        </div>
                        <FieldDescription>
                          Select the dispatch ledger for this booking. Add a new ledger without
                          leaving this form.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {isAvailabilityError ? (
              <p className="text-sm text-destructive">
                Availability limits could not be loaded. Refresh the daybook booking tab and try
                again.
              </p>
            ) : null}

            <BookingQuantitiesSection
              form={form}
              availabilityMap={availabilityMap}
              isAvailabilityLoading={isAvailabilityLoading}
              isAvailabilityReady={isAvailabilityReady}
            />

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional Notes
              </FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="sr-only">
                          Remarks
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
                          className="min-h-[120px] resize-y text-base"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting || !isGatePassNumberReady}
                onClick={handleOpenReview}
              >
                {isLoadingVoucherNumber
                  ? 'Loading pass no…'
                  : isSubmitting
                    ? 'Validating…'
                    : 'Review'}
              </Button>
            )}
          />
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = formSchema.safeParse(values);

          return (
            <BookingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              dispatchLedgerLabel={
                parsed.success ? getDispatchLedgerLabel(parsed.data.dispatchLedgerId) : ''
              }
              gatePassNo={nextVoucherNumber ?? null}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          );
        }}
      />

      <AddDispatchLedgerDialog
        open={addLedgerOpen}
        onOpenChange={setAddLedgerOpen}
        onSuccess={handleLedgerCreated}
      />
    </Card>
  );
};

export default CreateBookingForm;
