import type * as z from 'zod';

import { storageFormSchema } from '@/features/storage/schemas/storage-form-schema';

export type StorageSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultSubmitMeta: StorageSubmitMeta = {
  submitAction: 'review',
};

export type StorageFormValues = z.infer<typeof storageFormSchema>;
