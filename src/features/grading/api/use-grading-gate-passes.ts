import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getGradingGatePasses } from './get-grading-gate-passes';
import { gradingGatePassKeys } from './query-keys';
import type { GradingGatePassListParams, GradingGatePassListResult } from './types';

export function gradingGatePassesQueryOptions(params: GradingGatePassListParams) {
  return queryOptions({
    queryKey: gradingGatePassKeys.list(params),
    queryFn: () => getGradingGatePasses(params),
    placeholderData: keepPreviousData,
  });
}

type UseGradingGatePassesOptions = Omit<
  UseQueryOptions<
    GradingGatePassListResult,
    Error,
    GradingGatePassListResult,
    ReturnType<typeof gradingGatePassKeys.list>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useGradingGatePasses(
  params: GradingGatePassListParams,
  options?: UseGradingGatePassesOptions,
) {
  return useQuery({
    ...gradingGatePassesQueryOptions(params),
    ...options,
  });
}
