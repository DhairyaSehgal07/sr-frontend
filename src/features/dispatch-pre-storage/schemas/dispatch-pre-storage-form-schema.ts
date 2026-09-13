import * as z from 'zod';

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export const requiredPositiveIntField = z
  .string()
  .trim()
  .min(1, 'This field is required.')
  .refine(isPositiveIntString, 'Must be a whole number greater than zero');

export const dispatchPreStorageBookFieldsSchema = z.object({
  billBook: z.string(),
  biltiBook: z.string(),
});

export const editDispatchPreStorageFormSchema = z.object({
  manualGatePassNumber: z.string(),
  date: z.string().datetime('Select a valid date.'),
  dispatchLedgerId: z.string().length(24, 'Select a valid dispatch ledger.'),
  category: z.string().trim().min(1, 'Category is required.'),
  billNumber: z.string(),
  biltiNo: z.string(),
  billBook: requiredPositiveIntField,
  biltiBook: requiredPositiveIntField,
  from: z.string().trim().min(1, 'From is required'),
  to: z.string().trim().min(1, 'To is required'),
  truckNumber: z.string().trim().min(1, 'Truck number is required'),
  netWeight: z.string(),
  remarks: z.string().max(500),
});

export type EditDispatchPreStorageFormValues = z.infer<typeof editDispatchPreStorageFormSchema>;

export function isValidRequiredPositiveInt(value: string): boolean {
  return requiredPositiveIntField.safeParse(value).success;
}
