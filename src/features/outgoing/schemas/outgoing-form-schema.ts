import * as z from 'zod';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

function isPositiveIntString(value: string): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

const requiredPositiveIntField = z
  .string()
  .trim()
  .min(1, 'This field is required.')
  .refine(isPositiveIntString, 'Must be a whole number greater than zero');

export const outgoingAllocationSchema = z.object({
  storageGatePassId: objectId,
  bagSize: z.string().min(1, 'Bag size is required'),
  bagIndex: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  location: z.object({
    chamber: z.string(),
    floor: z.string(),
    row: z.string(),
  }),
});

export const outgoingStep1Schema = z.object({
  farmerStorageLinkId: objectId,
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
  truckNumber: z.string().trim(),
  category: z.string().trim().min(1, 'Category is required.').max(100),
  billNumber: requiredPositiveIntField,
  biltiNumber: requiredPositiveIntField,
  billBook: z.string().trim().min(1, 'This field is required.'),
  biltiBook: z.string().trim().min(1, 'This field is required.'),
  allocations: z
    .record(z.string(), z.number().int().min(1))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'Select at least one allocation in the gate passes table',
    }),
});

export const outgoingStep2Schema = z.object({
  remarks: z.string().max(500),
  weightsBySize: z.record(z.string(), z.number().positive('Enter average weight in kg').optional()),
});

export const outgoingStep2SubmitSchema = outgoingStep2Schema.superRefine((value, ctx) => {
  const entries = Object.entries(value.weightsBySize);
  if (entries.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter average weight in kg for each size',
      path: ['weightsBySize'],
    });
    return;
  }

  for (const [key, weight] of entries) {
    if (weight == null || weight <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter average weight in kg',
        path: ['weightsBySize', key],
      });
    }
  }
});

export const outgoingFormSchema = z.object({
  step1: outgoingStep1Schema,
  step2: outgoingStep2Schema,
});

export const outgoingFormSubmitSchema = z.object({
  step1: outgoingStep1Schema,
  step2: outgoingStep2SubmitSchema,
});

export type OutgoingFormValues = z.infer<typeof outgoingFormSchema>;
export type OutgoingFormSubmitValues = z.infer<typeof outgoingFormSubmitSchema>;
export type OutgoingStep1Values = z.infer<typeof outgoingStep1Schema>;
export type OutgoingStep2Values = z.infer<typeof outgoingStep2Schema>;
export type OutgoingAllocationItem = z.infer<typeof outgoingAllocationSchema>;

export type OutgoingSummaryValues = OutgoingStep1Values & {
  remarks: string;
  weightsBySize: OutgoingStep2Values['weightsBySize'];
};

export function flattenOutgoingFormValues(values: OutgoingFormValues): OutgoingSummaryValues {
  return {
    ...values.step1,
    remarks: values.step2.remarks,
    weightsBySize: values.step2.weightsBySize,
  };
}
