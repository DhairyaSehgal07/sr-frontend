import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getGradingGatePassById } from './get-grading-gate-pass-by-id';
import { gradingGatePassKeys } from './query-keys';
import type { GradingGatePass } from './types';

export function gradingGatePassByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: gradingGatePassKeys.detail(id),
    queryFn: () => getGradingGatePassById(id),
    enabled: id.trim().length > 0,
  });
}

type UseGradingGatePassByIdOptions = Omit<
  UseQueryOptions<
    GradingGatePass | null,
    Error,
    GradingGatePass | null,
    ReturnType<typeof gradingGatePassKeys.detail>
  >,
  'queryKey' | 'queryFn' | 'enabled'
>;

export function useGradingGatePassById(id: string, options?: UseGradingGatePassByIdOptions) {
  const query = useQuery({
    ...gradingGatePassByIdQueryOptions(id),
    ...options,
  });

  return {
    gatePass: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
