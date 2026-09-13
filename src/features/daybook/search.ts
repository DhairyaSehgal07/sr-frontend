import { z } from 'zod';

export const DAYBOOK_TAB_VALUES = [
  'incoming',
  'grading',
  'storage',
  'dispatch',
  'booking',
] as const;

export const DAYBOOK_LIST_TYPE_VALUES = ['all', 'incoming', 'outgoing'] as const;
export const DAYBOOK_SORT_BY_VALUES = ['latest', 'oldest'] as const;

export const daybookTabSchema = z.enum(DAYBOOK_TAB_VALUES);
export const daybookListTypeSchema = z.enum(DAYBOOK_LIST_TYPE_VALUES);
export const daybookSortBySchema = z.enum(DAYBOOK_SORT_BY_VALUES);

export const daybookSearchSchema = z.object({
  tab: daybookTabSchema.catch('incoming'),
  type: daybookListTypeSchema.catch('all').optional(),
  sortBy: daybookSortBySchema.catch('latest').optional(),
  page: z.coerce.number().int().min(1).catch(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).catch(10).optional(),
});

export type DaybookTab = z.infer<typeof daybookTabSchema>;
export type DaybookListType = z.infer<typeof daybookListTypeSchema>;
export type DaybookSortBy = z.infer<typeof daybookSortBySchema>;
export type DaybookSearch = z.infer<typeof daybookSearchSchema>;
