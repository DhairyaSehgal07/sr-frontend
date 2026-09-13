import * as z from 'zod';
import { refineQuantitiesAgainstAvailability } from '@/features/booking/lib/booking-availability';
import { BAG_SIZES } from '@/lib/constants';

const bookingQuantityRowSchema = z.object({
  size: z.union([z.enum(BAG_SIZES), z.literal('')]),
  isExtra: z.boolean(),
  variety: z.string(),
  qty: z.number().nonnegative('Quantity cannot be negative.').optional(),
});

export type AvailabilityValidationContext = {
  availabilityMap: Map<string, number>;
  originalQtyMap?: Map<string, number>;
  validateAvailability?: boolean;
};

function refineBookingQuantities(
  rows: z.infer<typeof bookingQuantityRowSchema>[],
  ctx: z.RefinementCtx,
  availability?: AvailabilityValidationContext,
) {
  rows.forEach((row, index) => {
    if (row.isExtra && row.size === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a bag size.',
        path: [index, 'size'],
      });
    }

    if ((row.qty ?? 0) > 0 && row.variety.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select variety for each bag line with quantity.',
        path: [index, 'variety'],
      });
    }
  });

  const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0);
  if (totalBags <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter at least one bag quantity.',
      path: [],
    });
  }

  if (availability?.validateAvailability && availability.availabilityMap.size > 0) {
    refineQuantitiesAgainstAvailability(
      rows,
      ctx,
      availability.availabilityMap,
      availability.originalQtyMap,
    );
  }
}

export function createBookingQuantitiesSchema(availability?: AvailabilityValidationContext) {
  return z.object({
    quantities: z
      .array(bookingQuantityRowSchema)
      .superRefine((rows, ctx) => refineBookingQuantities(rows, ctx, availability)),
  });
}

export const bookingQuantitiesSchema = createBookingQuantitiesSchema();

export type BookingQuantitiesValues = z.infer<ReturnType<typeof createBookingQuantitiesSchema>>;

export type BookingQuantityRow = BookingQuantitiesValues['quantities'][number];

export function createDefaultBookingQuantities(): BookingQuantityRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    variety: '',
    qty: undefined,
  }));
}

export function createEmptyBookingQuantityRow(): BookingQuantityRow {
  return {
    size: '',
    isExtra: true,
    variety: '',
    qty: undefined,
  };
}
