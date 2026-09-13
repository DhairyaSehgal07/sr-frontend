import * as z from 'zod';
import { storageQuantitiesSchema } from '@/features/storage/schemas/storage-quantities-schema';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

const storageBaseSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive('Enter a positive gate pass number.'),
  ]),
  farmerStorageLinkId: objectId,
  createdBy: objectId,
  variety: z.string().min(1, 'Select a variety.'),
  category: z.string().min(1, 'Select a category.'),
  stage: z.string(),
  date: z.string().datetime('Select a valid date.'),
  remarks: z.string(),
});

export const storageFormSchema = storageBaseSchema.merge(storageQuantitiesSchema);

export type StorageFormValues = z.infer<typeof storageFormSchema>;

export {
  storageQuantitiesSchema,
  createDefaultStorageQuantities,
  createEmptyStorageQuantityRow,
  type StorageQuantityRow,
} from '@/features/storage/schemas/storage-quantities-schema';
