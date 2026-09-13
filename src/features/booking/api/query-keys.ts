import type { BookingEditsListParams, BookingListParams } from './types';

export const bookingKeys = {
  all: ['booking'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: BookingListParams) => [...bookingKeys.lists(), params] as const,
  searches: () => [...bookingKeys.all, 'search'] as const,
  search: (number: number) => [...bookingKeys.searches(), number] as const,
  create: () => [...bookingKeys.all, 'create'] as const,
  update: (id: string) => [...bookingKeys.all, 'update', id] as const,
  summary: () => [...bookingKeys.all, 'summary'] as const,
  storageSummary: () => [...bookingKeys.all, 'storage-summary'] as const,
  editsLists: () => [...bookingKeys.all, 'edits'] as const,
  edits: (params: BookingEditsListParams) => [...bookingKeys.editsLists(), params] as const,
};
