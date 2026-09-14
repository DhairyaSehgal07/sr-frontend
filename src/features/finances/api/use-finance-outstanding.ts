import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getFinanceOutstanding } from './get-finance-outstanding';
import { financeKeys } from './query-keys';
import type { FinanceListParams, FinanceOutstanding } from './types';

export function financeOutstandingQueryOptions(params: FinanceListParams = {}) {
  return queryOptions({
    queryKey: financeKeys.outstanding(params),
    queryFn: () => getFinanceOutstanding(params),
    placeholderData: keepPreviousData,
  });
}

type UseFinanceOutstandingOptions = Omit<
  UseQueryOptions<
    FinanceOutstanding[],
    Error,
    FinanceOutstanding[],
    ReturnType<typeof financeKeys.outstanding>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useFinanceOutstanding(
  params: FinanceListParams = {},
  options?: UseFinanceOutstandingOptions,
) {
  return useQuery({
    ...financeOutstandingQueryOptions(params),
    ...options,
  });
}
