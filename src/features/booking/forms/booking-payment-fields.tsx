import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ManagedSearchableOptionCombobox } from '@/components/searchable-option-combobox';
import type { CreateBookingFormApi } from '@/features/booking/forms/use-create-booking-form';
import {
  BOOKING_PAYMENT_MODES,
  type BookingPaymentMode,
} from '@/features/booking/schemas/booking-form-schema';

const NONE_PAYMENT_MODE = '__none__';

const PAYMENT_MODE_OPTIONS = [
  { id: NONE_PAYMENT_MODE, label: 'None' },
  ...BOOKING_PAYMENT_MODES.map((mode) => ({ id: mode, label: mode })),
];

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

type BookingPaymentFieldsProps = {
  form: CreateBookingFormApi;
};

export function BookingPaymentFields({ form }: BookingPaymentFieldsProps) {
  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">Payment</FieldLegend>
      <FieldDescription>Bank and mode of payment are optional.</FieldDescription>
      <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
        <form.Field name="bank">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bank</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="e.g. State Bank of India (optional)"
                  className="text-base"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="modeOfPayment">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Mode of payment</FieldLabel>
                <ManagedSearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onValueChange={(value) =>
                    field.handleChange(
                      !value || value === NONE_PAYMENT_MODE
                        ? undefined
                        : (value as BookingPaymentMode),
                    )
                  }
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select mode (optional)"
                  emptyMessage="No payment modes found."
                  options={PAYMENT_MODE_OPTIONS}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
    </FieldSet>
  );
}
