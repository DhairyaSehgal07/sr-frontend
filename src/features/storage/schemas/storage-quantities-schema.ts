import * as z from 'zod';
import { BAG_SIZES, BAG_TYPES, DEFAULT_BAG_TYPE } from '@/lib/constants';

const storageQuantityRowSchema = z.object({
  size: z.union([z.enum(BAG_SIZES), z.literal('')]),
  isExtra: z.boolean(),
  qty: z.number().nonnegative('Quantity cannot be negative.').optional(),
  bagType: z.enum(BAG_TYPES),
  chamber: z.string(),
  floor: z.string(),
  row: z.string(),
});

export const storageQuantitiesSchema = z.object({
  quantities: z.array(storageQuantityRowSchema).superRefine((rows, ctx) => {
    rows.forEach((row, index) => {
      if (row.isExtra && row.size === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a bag size.',
          path: [index, 'size'],
        });
      }
    });
  }),
});

export type StorageQuantitiesValues = z.infer<typeof storageQuantitiesSchema>;

export type StorageQuantityRow = StorageQuantitiesValues['quantities'][number];

export function createDefaultStorageQuantities(): StorageQuantityRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: '',
    floor: '',
    row: '',
  }));
}

export function createEmptyStorageQuantityRow(): StorageQuantityRow {
  return {
    size: '',
    isExtra: true,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    chamber: '',
    floor: '',
    row: '',
  };
}
