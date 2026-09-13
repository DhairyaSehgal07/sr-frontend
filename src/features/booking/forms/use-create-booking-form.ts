import { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';

import {
  createBookingFormSchema,
  createDefaultBookingQuantities,
  type AvailabilityValidationContext,
  type BookingFormValues,
} from '@/features/booking/schemas/booking-form-schema';
import { defaultSubmitMeta, type BookingSubmitMeta } from '@/features/booking/types';

export type CreateBookingFormApi = ReturnType<typeof useCreateBookingForm>['form'];

type UseCreateBookingFormOptions = {
  defaultValues?: BookingFormValues;
  availability?: AvailabilityValidationContext;
  onOpenReview?: () => void;
  onCreate?: (values: BookingFormValues) => Promise<void>;
};

export function useCreateBookingForm(options: UseCreateBookingFormOptions = {}) {
  const todayIso = new Date().toISOString();

  const formSchema = useMemo(
    () =>
      createBookingFormSchema(
        options.availability
          ? {
              availabilityMap: options.availability.availabilityMap ?? new Map(),
              originalQtyMap: options.availability.originalQtyMap,
              validateAvailability: options.availability.validateAvailability ?? false,
            }
          : undefined,
      ),
    [options.availability],
  );

  const validators = useMemo(
    () => ({
      onBlur: formSchema,
      onSubmit: formSchema,
    }),
    [formSchema],
  );

  const form = useForm({
    defaultValues: options.defaultValues ?? {
      manualGatePassNumber: undefined as number | undefined,
      dispatchLedgerId: '',
      date: todayIso,
      quantities: createDefaultBookingQuantities(),
      remarks: '',
    },
    validators,
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = formSchema.parse(value);

      if ((meta as BookingSubmitMeta).submitAction === 'review') {
        options.onOpenReview?.();
        return;
      }

      await options.onCreate?.(parsed);
    },
  });

  return { form };
}
