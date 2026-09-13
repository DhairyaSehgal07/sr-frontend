import * as z from 'zod';
import { BAG_SIZES, DEFAULT_BAG_TYPE } from '@/lib/constants';

const quantityRowSchema = z.object({
  size: z.string(),
  isExtra: z.boolean(),
  qty: z.number().nonnegative('Quantity cannot be negative.').optional(),
  bagType: z.string().min(1, 'Select a bag type.'),
  weight: z.number().nonnegative('Weight cannot be negative.').optional(),
});

export const gradingFillDetailsSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive('Enter a positive gate pass number.'),
  ]),
  date: z.string().datetime('Select a valid date.'),
  quantities: z.array(quantityRowSchema).superRefine((rows, ctx) => {
    rows.forEach((row, index) => {
      if (row.isExtra && row.size === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a bag size.',
          path: [index, 'size'],
        });
      }
    });

    const hasActiveRow = rows.some((row) => (row.qty ?? 0) > 0);
    if (!hasActiveRow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter at least one bag quantity.',
        path: [],
      });
    }
  }),
  remarks: z.string(),
});

export type GradingFillDetailsValues = z.infer<typeof gradingFillDetailsSchema>;

export type GradingQuantityRow = GradingFillDetailsValues['quantities'][number];

export function createDefaultQuantities(): GradingQuantityRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    weight: undefined,
  }));
}

export function createEmptyQuantityRow(): GradingQuantityRow {
  return {
    size: '',
    isExtra: true,
    qty: undefined,
    bagType: DEFAULT_BAG_TYPE,
    weight: undefined,
  };
}

export function gradingRowTotalWeightKg(row: GradingQuantityRow): number {
  return (row.qty ?? 0) * (row.weight ?? 0);
}

export function gradingTotalWeightKg(rows: readonly GradingQuantityRow[]): number {
  return rows.reduce((sum, row) => sum + gradingRowTotalWeightKg(row), 0);
}
