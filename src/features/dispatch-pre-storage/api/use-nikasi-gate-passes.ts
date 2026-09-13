import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getNikasiGatePasses } from './get-nikasi-gate-passes';
import { nikasiGatePassKeys } from './types';
import type { NikasiGatePassListParams, NikasiGatePassListResult } from './types';

export function nikasiGatePassesQueryOptions(params: NikasiGatePassListParams) {
  return queryOptions({
    queryKey: nikasiGatePassKeys.list(params),
    queryFn: () => getNikasiGatePasses(params),
    placeholderData: keepPreviousData,
  });
}

type UseNikasiGatePassesOptions = Omit<
  UseQueryOptions<
    NikasiGatePassListResult,
    Error,
    NikasiGatePassListResult,
    ReturnType<typeof nikasiGatePassKeys.list>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useNikasiGatePasses(
  params: NikasiGatePassListParams,
  options?: UseNikasiGatePassesOptions,
) {
  return useQuery({
    ...nikasiGatePassesQueryOptions(params),
    ...options,
  });
}
