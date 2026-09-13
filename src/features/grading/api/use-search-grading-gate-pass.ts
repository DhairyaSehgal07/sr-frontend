import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { gradingGatePassKeys } from './query-keys';
import { searchGradingGatePasses } from './search-grading-gate-passes';
import type { GradingGatePassListResult } from './types';

export function searchGradingGatePassQueryOptions(number: number) {
  return queryOptions({
    queryKey: gradingGatePassKeys.search(number),
    queryFn: () => searchGradingGatePasses({ number }),
    placeholderData: keepPreviousData,
  });
}

type UseSearchGradingGatePassOptions = Omit<
  UseQueryOptions<
    GradingGatePassListResult,
    Error,
    GradingGatePassListResult,
    ReturnType<typeof gradingGatePassKeys.search>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useSearchGradingGatePass(
  number: number,
  options?: UseSearchGradingGatePassOptions,
) {
  return useQuery({
    ...searchGradingGatePassQueryOptions(number),
    ...options,
  });
}
