import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getBillBooks } from './get-bill-books';
import { billBookKeys } from './query-keys';
import type { BillBook, BillBookListParams } from './types';

export function billBooksQueryOptions(params: BillBookListParams = {}) {
  return queryOptions({
    queryKey: billBookKeys.list(params),
    queryFn: () => getBillBooks(params),
    placeholderData: keepPreviousData,
  });
}

type UseBillBooksOptions = Omit<
  UseQueryOptions<BillBook[], Error, BillBook[], ReturnType<typeof billBookKeys.list>>,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useBillBooks(params: BillBookListParams = {}, options?: UseBillBooksOptions) {
  return useQuery({
    ...billBooksQueryOptions(params),
    ...options,
  });
}
