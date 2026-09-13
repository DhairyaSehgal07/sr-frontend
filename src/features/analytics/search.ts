import { z } from 'zod';

export const ANALYTICS_TAB_VALUES = [
  'incoming',
  'grading',
  'storage',
  'dispatch',
  'booking',
] as const;

export const analyticsTabSchema = z.enum(ANALYTICS_TAB_VALUES);

export const analyticsSearchSchema = z.object({
  tab: analyticsTabSchema.catch('incoming'),
});

export type AnalyticsTab = z.infer<typeof analyticsTabSchema>;
