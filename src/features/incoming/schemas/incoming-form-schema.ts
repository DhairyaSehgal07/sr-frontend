import * as z from 'zod';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

export const weightSlipSchema = z.object({
  slipNumber: z.string().min(1, 'Slip number is required.'),
  grossWeightKg: z.number().positive('Gross weight must be greater than zero.'),
  tareWeightKg: z.number().nonnegative('Tare weight cannot be negative.'),
});

export const incomingFormSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive('Enter a positive gate pass number.'),
  ]),
  truckNumber: z
    .string()
    .min(1, 'Truck number is required.')
    .transform((val) => val.toUpperCase()),
  farmerStorageLinkId: objectId,
  createdBy: objectId,
  variety: z.string().min(1, 'Select a variety.'),
  category: z.string().min(1, 'Select a category.'),
  stage: z.string().min(1, 'Select a stage.'),
  date: z.string().datetime('Select a valid date.'),
  bagsReceived: z.number().positive('Bags received must be greater than zero.'),
  weightSlip: weightSlipSchema,
  status: z.string().min(1, 'Select a status.'),
  remarks: z.string(),
});
