import * as z from 'zod';
import {
  createBookingQuantitiesSchema,
  type AvailabilityValidationContext,
} from '@/features/booking/schemas/booking-quantities-schema';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

export const BOOKING_PAYMENT_MODES = ['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'Card'] as const;

export type BookingPaymentMode = (typeof BOOKING_PAYMENT_MODES)[number];

export function isBookingPaymentMode(value: string): value is BookingPaymentMode {
  return (BOOKING_PAYMENT_MODES as readonly string[]).includes(value);
}

const bookingBaseSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive('Enter a positive gate pass number.'),
  ]),
  dispatchLedgerId: objectId,
  billBookId: objectId,
  date: z.string().datetime('Select a valid date.'),
  expectedDateOfDelivery: z.union([
    z.undefined(),
    z.literal(''),
    z.string().datetime('Select a valid expected delivery date.'),
  ]),
  agent: z.string().trim().min(1, 'Enter the agent.'),
  bank: z.union([z.undefined(), z.literal(''), z.string()]),
  modeOfPayment: z.union([z.undefined(), z.literal(''), z.enum(BOOKING_PAYMENT_MODES)]),
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
