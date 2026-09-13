import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Loader2, UserPlus } from 'lucide-react';
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
import type { Booking } from '@/features/booking/api/types';
import { useBookingById } from '@/features/booking/api/use-booking-by-id';
import { useUpdateBooking } from '@/features/booking/api/use-update-booking';
import { BookingQuantitiesSection } from '@/features/booking/forms/booking-quantities-section';
import { BookingSummarySheet } from '@/features/booking/forms/booking-summary-sheet';
import { bookingToFormValues } from '@/features/booking/forms/booking-to-form-values';
import { useCreateBookingForm } from '@/features/booking/forms/use-create-booking-form';
import { useBookingAvailability } from '@/features/booking/hooks/use-booking-availability';
import { buildOriginalQtyMap } from '@/features/booking/lib/booking-availability';
import { createBookingFormSchema } from '@/features/booking/schemas/booking-form-schema';
import { useDispatchLedgers } from '@/features/people/api/use-dispatch-ledgers';
import { AddDispatchLedgerDialog } from '@/features/people/components/add-dispatch-ledger-dialog';
import type { DispatchLedger } from '@/features/people/types';
type EditBookingFormContentProps = {
  bookingId: string;
};

export function EditBookingForm() {
  const { id } = useParams({ from: '/_authenticated/booking/$id' });

  return <EditBookingFormContent bookingId={id} />;
}

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ledgerSearchLabelFromBooking(booking: Booking): string {
  return booking.dispatchLedgerId.name ?? '';
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const EditBookingFormContent = ({ bookingId }: EditBookingFormContentProps) => {
  const {
    booking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
    error: bookingError,
  } = useBookingById(bookingId);

  if (isLoadingBooking) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading booking gate pass…
        </CardContent>
      </Card>
    );
  }

  if (isBookingError) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive">
            {bookingError?.message ?? 'Failed to load booking gate pass.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Booking gate pass not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <EditBookingFormFields key={booking._id} booking={booking} />;
};

type EditBookingFormFieldsProps = {
  booking: Booking;
};

function EditBookingFormFields({ booking }: EditBookingFormFieldsProps) {
  const { data: dispatchLedgers = [] } = useDispatchLedgers();
  const { mutateAsync: updateBooking } = useUpdateBooking(booking._id);

  const defaultValues = useMemo(() => bookingToFormValues(booking), [booking]);

  const originalQtyMap = useMemo(() => buildOriginalQtyMap(booking.bagSizes), [booking.bagSizes]);

  const {
    availabilityMap,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    isReady: isAvailabilityReady,
  } = useBookingAvailability();

  const availabilityContext = useMemo(
    () => ({
      availabilityMap,
      originalQtyMap,
      validateAvailability: isAvailabilityReady,
    }),
    [availabilityMap, originalQtyMap, isAvailabilityReady],
  );

  const formSchema = useMemo(
    () => createBookingFormSchema(availabilityContext),
    [availabilityContext],
  );

  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(() => {
    const base = dispatchLedgers.map((ledger) => ({
      id: ledger._id,
      label: ledger.name,
    }));
    const ledger = booking.dispatchLedgerId;
    if (!ledger._id || base.some((option) => option.id === ledger._id)) {
      return base;
    }
    return [...base, { id: ledger._id, label: ledger.name }];
  }, [dispatchLedgers, booking]);

  const [ledgerSearch, setLedgerSearch] = useState(() => ledgerSearchLabelFromBooking(booking));
  const [ledgerComboboxOpen, setLedgerComboboxOpen] = useState(false);
  const [addLedgerOpen, setAddLedgerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedLedgers = useMemo(
    () => filterAndSortOptions(ledgerSearch, dispatchLedgerOptions),
    [ledgerSearch, dispatchLedgerOptions],
  );
  const resetComboboxState = () => {
    setLedgerSearch(ledgerSearchLabelFromBooking(booking));
    setLedgerComboboxOpen(false);
  };

  const { form } = useCreateBookingForm({
    defaultValues,
    availability: availabilityContext,
    onOpenReview: () => setReviewOpen(true),
    onCreate: async (parsed) => {
      try {
        const { message } = await updateBooking({
          id: booking._id,
          form: parsed,
          originalBagSizes: booking.bagSizes,
        });

        toast.success(message ?? 'Booking gate pass updated', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update booking gate pass', {
          position: 'bottom-right',
        });
      }
    },
  });

  const getDispatchLedgerLabel = (dispatchLedgerId: string) => {
    const fromList = dispatchLedgers.find((ledger) => ledger._id === dispatchLedgerId)?.name;
    if (fromList) return fromList;
    if (booking.dispatchLedgerId._id === dispatchLedgerId) {
      return ledgerSearchLabelFromBooking(booking);
    }
    return dispatchLedgerId;
  };

  const handleLedgerCreated = (ledger: DispatchLedger) => {
    form.setFieldValue('dispatchLedgerId', ledger._id);
    setLedgerSearch(ledger.name);
    setLedgerComboboxOpen(false);
  };

  const handleReset = () => {
    form.reset();
    resetComboboxState();
  };

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Edit Booking Gate Pass{' '}
          <span className="font-mono tabular-nums text-primary sm:text-2xl">
            #{booking.gatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Update dispatch ledger and bag quantities for this booking gate pass.
        </CardDescription>
      </CardHeader>

      <form id="edit-booking-form" noValidate onSubmit={(e) => e.preventDefault()}>
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
                        <FieldLabel htmlFor="edit-booking-ledger">Dispatch Ledger</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="edit-booking-ledger"
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
              originalQtyMap={originalQtyMap}
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
              <Button type="button" disabled={isSubmitting} onClick={handleOpenReview}>
                {isSubmitting ? 'Validating…' : 'Review'}
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
              gatePassNo={booking.gatePassNo}
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
}

export default EditBookingForm;
