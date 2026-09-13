import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getStorageGatePasses } from './get-storage-gate-passes';
import { storageGatePassKeys } from './query-keys';
import type { StorageGatePassListParams, StorageGatePassListResult } from './types';

export function storageGatePassesQueryOptions(params: StorageGatePassListParams) {
  return queryOptions({
    queryKey: storageGatePassKeys.list(params),
    queryFn: () => getStorageGatePasses(params),
    placeholderData: keepPreviousData,
  });
}

type UseStorageGatePassesOptions = Omit<
  UseQueryOptions<
    StorageGatePassListResult,
    Error,
    StorageGatePassListResult,
    ReturnType<typeof storageGatePassKeys.list>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useStorageGatePasses(
  params: StorageGatePassListParams,
  options?: UseStorageGatePassesOptions,
) {
  return useQuery({
    ...storageGatePassesQueryOptions(params),
    ...options,
  });
}
