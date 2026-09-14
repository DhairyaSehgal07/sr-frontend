import * as z from 'zod';

export const billBookFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must not exceed 120 characters'),
});

export type BillBookFormValues = z.infer<typeof billBookFormSchema>;

export type BillBookFormInput = {
  name: string;
};
