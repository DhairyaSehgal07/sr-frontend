import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getFinanceRecoveries } from './get-finance-recoveries';
import { financeKeys } from './query-keys';
import type { FinanceListParams, FinanceRecovery } from './types';

export function financeRecoveriesQueryOptions(params: FinanceListParams = {}) {
  return queryOptions({
    queryKey: financeKeys.recoveries(params),
    queryFn: () => getFinanceRecoveries(params),
    placeholderData: keepPreviousData,
  });
}

type UseFinanceRecoveriesOptions = Omit<
  UseQueryOptions<
    FinanceRecovery[],
    Error,
    FinanceRecovery[],
    ReturnType<typeof financeKeys.recoveries>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useFinanceRecoveries(
  params: FinanceListParams = {},
  options?: UseFinanceRecoveriesOptions,
) {
  return useQuery({
    ...financeRecoveriesQueryOptions(params),
    ...options,
  });
}
