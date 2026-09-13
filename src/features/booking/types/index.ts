import type * as z from 'zod';

import { bookingFormSchema } from '@/features/booking/schemas/booking-form-schema';

export type BookingSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultSubmitMeta: BookingSubmitMeta = {
  submitAction: 'review',
};

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
