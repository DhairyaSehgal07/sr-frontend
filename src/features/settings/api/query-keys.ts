import type { BillBookListParams } from './types';

export const billBookKeys = {
  all: ['bill-books'] as const,
  lists: () => [...billBookKeys.all, 'list'] as const,
  list: (params: BillBookListParams) => [...billBookKeys.lists(), params] as const,
  details: () => [...billBookKeys.all, 'detail'] as const,
  detail: (id: string) => [...billBookKeys.details(), id] as const,
  create: () => [...billBookKeys.all, 'create'] as const,
  update: () => [...billBookKeys.all, 'update'] as const,
};
