import * as z from 'zod';
import {
  createBookingQuantitiesSchema,
  type AvailabilityValidationContext,
} from '@/features/booking/schemas/booking-quantities-schema';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

const bookingBaseSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive('Enter a positive gate pass number.'),
  ]),
  dispatchLedgerId: objectId,
  date: z.string().datetime('Select a valid date.'),
  remarks: z.string(),
});

export function createBookingFormSchema(availability?: AvailabilityValidationContext) {
  return bookingBaseSchema.merge(createBookingQuantitiesSchema(availability));
}

export const bookingFormSchema = createBookingFormSchema();

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>;

export {
  createBookingQuantitiesSchema,
  createDefaultBookingQuantities,
  createEmptyBookingQuantityRow,
  type AvailabilityValidationContext,
  type BookingQuantityRow,
} from '@/features/booking/schemas/booking-quantities-schema';
