import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getFinanceSales } from './get-finance-sales';
import { financeKeys } from './query-keys';
import type { FinanceListParams, FinanceSale } from './types';

export function financeSalesQueryOptions(params: FinanceListParams = {}) {
  return queryOptions({
    queryKey: financeKeys.sales(params),
    queryFn: () => getFinanceSales(params),
    placeholderData: keepPreviousData,
  });
}

type UseFinanceSalesOptions = Omit<
  UseQueryOptions<FinanceSale[], Error, FinanceSale[], ReturnType<typeof financeKeys.sales>>,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useFinanceSales(params: FinanceListParams = {}, options?: UseFinanceSalesOptions) {
  return useQuery({
    ...financeSalesQueryOptions(params),
    ...options,
  });
}
