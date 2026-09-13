import * as z from 'zod';

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

const requiredPositiveIntField = z
  .string()
  .trim()
  .min(1, 'This field is required.')
  .refine(isPositiveIntString, 'Must be a whole number greater than zero');

export const editOutgoingFormSchema = z.object({
  date: z.string().datetime('Select a valid date.'),
  manualGatePassNumber: z.union([
    z.undefined(),
    z
      .number()
      .int('Manual gate pass number must be a whole number')
      .positive('Manual gate pass number must be greater than zero'),
  ]),
  from: z.string().trim().min(1, 'From is required'),
  to: z.string().trim().min(1, 'To is required'),
  truckNumber: z.string().trim().min(1, 'Truck number is required'),
  category: z.string().trim().min(1, 'Category is required.').max(100),
  billNumber: requiredPositiveIntField,
  biltiNumber: requiredPositiveIntField,
  billBook: requiredPositiveIntField,
  biltiBook: requiredPositiveIntField,
  remarks: z.string().max(500),
});

export type EditOutgoingFormValues = z.infer<typeof editOutgoingFormSchema>;
