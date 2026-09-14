import { z } from 'zod';

export const FINANCES_TAB_VALUES = ['sales', 'recovery'] as const;

export const ALL_BILL_BOOKS = 'all';

export const financesTabSchema = z.enum(FINANCES_TAB_VALUES);

export const financesSearchSchema = z.object({
  tab: financesTabSchema.catch('sales'),
  billBookId: z.string().optional(),
});

export type FinancesTab = z.infer<typeof financesTabSchema>;
export type FinancesSearch = z.infer<typeof financesSearchSchema>;
