import * as z from 'zod';

import { isDirectSaleOutgoing } from '@/lib/constants';

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

const requiredPositiveIntField = z
  .string()
  .trim()
  .min(1, 'This field is required.')
  .refine(isPositiveIntString, 'Must be a whole number greater than zero');

function requireTrimmed(value: string, path: string, message: string, ctx: z.RefinementCtx) {
  if (value.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: [path],
    });
  }
}

function requirePositiveInt(value: string, path: string, ctx: z.RefinementCtx) {
  const parsed = requiredPositiveIntField.safeParse(value);
  if (!parsed.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: parsed.error.issues[0]?.message ?? 'This field is required.',
      path: [path],
    });
  }
}

export const editOutgoingFormSchema = z
  .object({
    date: z.string().datetime('Select a valid date.'),
    manualGatePassNumber: z.union([
      z.undefined(),
      z
        .number()
        .int('Manual gate pass number must be a whole number')
        .positive('Manual gate pass number must be greater than zero'),
    ]),
    from: z.string().trim(),
    to: z.string().trim(),
    truckNumber: z.string().trim(),
    transportCompany: z.string().trim(),
    LSNumber: z.string().trim(),
    driverName: z.string().trim(),
    driverMobile: z.string().trim(),
    owner: z.string().trim(),
    category: z.string().trim().min(1, 'Category is required.').max(100),
    billNumber: z.string(),
    biltiNumber: z.string(),
    billBook: z.string().trim(),
    biltiBook: z.string().trim(),
    remarks: z.string().max(500),
  })
  .superRefine((value, ctx) => {
    if (!isDirectSaleOutgoing(value.category)) return;

    requireTrimmed(value.from, 'from', 'From is required', ctx);
    requireTrimmed(value.to, 'to', 'To is required', ctx);
    requireTrimmed(value.truckNumber, 'truckNumber', 'Truck number is required', ctx);
    requireTrimmed(value.transportCompany, 'transportCompany', 'Transport company is required', ctx);
    requireTrimmed(value.LSNumber, 'LSNumber', 'L.S. No. is required', ctx);
    requireTrimmed(value.driverName, 'driverName', 'Driver name is required', ctx);
    requireTrimmed(value.driverMobile, 'driverMobile', 'Driver mobile is required', ctx);
    requireTrimmed(value.owner, 'owner', 'Owner is required', ctx);
    requirePositiveInt(value.billNumber, 'billNumber', ctx);
    requirePositiveInt(value.biltiNumber, 'biltiNumber', ctx);
    requireTrimmed(value.billBook, 'billBook', 'This field is required.', ctx);
    requireTrimmed(value.biltiBook, 'biltiBook', 'This field is required.', ctx);
  });

export type EditOutgoingFormValues = z.infer<typeof editOutgoingFormSchema>;
