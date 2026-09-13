import type { DaybookQueryParams } from './types';

export const daybookKeys = {
  all: ['store-admin', 'daybook'] as const,
  lists: () => [...daybookKeys.all, 'list'] as const,
  list: (params: DaybookQueryParams) => [...daybookKeys.lists(), params] as const,
};
