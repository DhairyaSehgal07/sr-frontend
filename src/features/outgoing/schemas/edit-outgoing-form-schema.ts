import * as z from 'zod';

import { isDirectSaleOutgoing, OUTGOING_SHEDS, type OutgoingShed } from '@/lib/constants';

function isOutgoingShed(value: string): value is OutgoingShed {
  return (OUTGOING_SHEDS as readonly string[]).includes(value);
}

const optionalShedField = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || isOutgoingShed(value), 'Select a shed from the list.');

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

const optionalPositiveIntField = z.string().refine((value) => {
  const trimmed = value.trim();
  return trimmed.length === 0 || isPositiveIntString(trimmed);
}, 'Must be a whole number greater than zero');

function requireCostPerBag(value: string, ctx: z.RefinementCtx) {
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (trimmed.length === 0 || !Number.isFinite(parsed) || parsed <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cost per bag is required.',
      path: ['costPerBag'],
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
    shed: optionalShedField,
    preSowingTreatment: z.boolean(),
    billNumber: optionalPositiveIntField,
    biltiNumber: optionalPositiveIntField,
    billBook: z.string().trim(),
    biltiBook: z.string().trim(),
    costPerBag: z.string(),
    remarks: z.string().max(500),
  })
  .superRefine((value, ctx) => {
    if (!isDirectSaleOutgoing(value.category)) return;
    requireCostPerBag(value.costPerBag, ctx);
  });

export type EditOutgoingFormValues = z.infer<typeof editOutgoingFormSchema>;
