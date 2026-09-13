import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getIncomingGatePassEdits } from './get-incoming-gate-pass-edits';
import { incomingGatePassKeys } from './query-keys';
import type { IncomingGatePassEditsListParams, IncomingGatePassEditsListResult } from './types';

export function incomingGatePassEditsQueryOptions(params: IncomingGatePassEditsListParams) {
  return queryOptions({
    queryKey: incomingGatePassKeys.edits(params),
    queryFn: () => getIncomingGatePassEdits(params),
    placeholderData: keepPreviousData,
  });
}

type UseIncomingGatePassEditsOptions = Omit<
  UseQueryOptions<
    IncomingGatePassEditsListResult,
    Error,
    IncomingGatePassEditsListResult,
    ReturnType<typeof incomingGatePassKeys.edits>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useIncomingGatePassEdits(
  params: IncomingGatePassEditsListParams,
  options?: UseIncomingGatePassEditsOptions,
) {
  return useQuery({
    ...incomingGatePassEditsQueryOptions(params),
    ...options,
  });
}
