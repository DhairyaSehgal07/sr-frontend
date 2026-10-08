import { z } from 'zod';

export const DAYBOOK_TAB_VALUES = ['dispatch'] as const;

export const daybookTabSchema = z.enum(DAYBOOK_TAB_VALUES);

export const daybookSearchSchema = z.object({
  tab: daybookTabSchema.catch('dispatch'),
});

export type DaybookTab = z.infer<typeof daybookTabSchema>;
export type DaybookSearch = z.infer<typeof daybookSearchSchema>;
