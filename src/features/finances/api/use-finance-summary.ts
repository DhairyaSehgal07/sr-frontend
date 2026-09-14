import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getFinanceSummary } from './get-finance-summary';
import { financeKeys } from './query-keys';
import type { FinanceListParams, FinanceSummary } from './types';

export function financeSummaryQueryOptions(params: FinanceListParams = {}) {
  return queryOptions({
    queryKey: financeKeys.summary(params),
    queryFn: () => getFinanceSummary(params),
    placeholderData: keepPreviousData,
  });
}

type UseFinanceSummaryOptions = Omit<
  UseQueryOptions<
    FinanceSummary,
    Error,
    FinanceSummary,
    ReturnType<typeof financeKeys.summary>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useFinanceSummary(
  params: FinanceListParams = {},
  options?: UseFinanceSummaryOptions,
) {
  return useQuery({
    ...financeSummaryQueryOptions(params),
    ...options,
  });
}
