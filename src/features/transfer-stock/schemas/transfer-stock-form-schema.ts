import * as z from 'zod';

export const objectId = z.string().length(24, 'Select a valid record from the list.');

export const transferStockAllocationSchema = z.object({
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

export const transferStockFormSchema = z
  .object({
    manualGatePassNumber: z.union([
      z.undefined(),
      z.number().positive('Enter a positive gate pass number.'),
    ]),
    fromFarmerStorageLinkId: objectId,
    toFarmerStorageLinkId: objectId,
    date: z.string().min(1, 'Date is required'),
    category: z.string().min(1, 'Select a category.'),
    truckNumber: z.string().trim(),
    remarks: z.string().max(500),
    allocations: z
      .record(z.string(), z.number().int().min(1))
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'Select at least one allocation in the gate passes table',
      }),
  })
  .refine((d) => d.fromFarmerStorageLinkId !== d.toFarmerStorageLinkId, {
    message: 'Source and destination must be different accounts',
    path: ['toFarmerStorageLinkId'],
  });

export type TransferStockFormValues = z.infer<typeof transferStockFormSchema>;
export type TransferStockAllocationItem = z.infer<typeof transferStockAllocationSchema>;
