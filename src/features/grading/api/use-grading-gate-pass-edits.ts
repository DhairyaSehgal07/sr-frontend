import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getGradingGatePassEdits } from './get-grading-gate-pass-edits';
import { gradingGatePassKeys } from './query-keys';
import type { GradingGatePassEditsListParams, GradingGatePassEditsListResult } from './types';

export function gradingGatePassEditsQueryOptions(params: GradingGatePassEditsListParams) {
  return queryOptions({
    queryKey: gradingGatePassKeys.edits(params),
    queryFn: () => getGradingGatePassEdits(params),
    placeholderData: keepPreviousData,
  });
}

type UseGradingGatePassEditsOptions = Omit<
  UseQueryOptions<
    GradingGatePassEditsListResult,
    Error,
    GradingGatePassEditsListResult,
    ReturnType<typeof gradingGatePassKeys.edits>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useGradingGatePassEdits(
  params: GradingGatePassEditsListParams,
  options?: UseGradingGatePassEditsOptions,
) {
  return useQuery({
    ...gradingGatePassEditsQueryOptions(params),
    ...options,
  });
}
