import type * as z from 'zod';

import { outgoingFormSchema } from '@/features/outgoing/schemas/outgoing-form-schema';

export type OutgoingSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultSubmitMeta: OutgoingSubmitMeta = {
  submitAction: 'review',
};

export type OutgoingFormValues = z.infer<typeof outgoingFormSchema>;
