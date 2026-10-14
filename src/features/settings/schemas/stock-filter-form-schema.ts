import * as z from 'zod';

export const stockFilterFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must not exceed 120 characters'),
});

export type StockFilterFormValues = z.infer<typeof stockFilterFormSchema>;

export type StockFilterFormInput = {
  name: string;
};
