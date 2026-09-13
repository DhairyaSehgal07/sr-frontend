import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getDaybook } from './get-daybook';
import { daybookKeys } from './query-keys';
import type { DaybookListResult, DaybookQueryParams } from './types';

const DEFAULT_PARAMS: DaybookQueryParams = {
  type: 'all',
  sortBy: 'latest',
  page: 1,
  limit: 10,
};

export function daybookQueryOptions(params: DaybookQueryParams = DEFAULT_PARAMS) {
  return queryOptions({
    queryKey: daybookKeys.list(params),
    queryFn: () => getDaybook(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

type UseDaybookOptions = Omit<
  UseQueryOptions<DaybookListResult, Error, DaybookListResult, ReturnType<typeof daybookKeys.list>>,
  'queryKey' | 'queryFn' | 'placeholderData' | 'staleTime'
>;

export function useDaybook(
  params: DaybookQueryParams = DEFAULT_PARAMS,
  options?: UseDaybookOptions,
) {
  return useQuery({
    ...daybookQueryOptions(params),
    ...options,
  });
}
