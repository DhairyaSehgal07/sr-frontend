import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { searchStorageGatePasses } from './search-storage-gate-passes';
import { storageGatePassKeys } from './query-keys';
import type { StorageGatePassListResult } from './types';

export function searchStorageGatePassQueryOptions(number: number) {
  return queryOptions({
    queryKey: storageGatePassKeys.search(number),
    queryFn: () => searchStorageGatePasses({ number }),
    placeholderData: keepPreviousData,
  });
}

type UseSearchStorageGatePassOptions = Omit<
  UseQueryOptions<
    StorageGatePassListResult,
    Error,
    StorageGatePassListResult,
    ReturnType<typeof storageGatePassKeys.search>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useSearchStorageGatePass(
  number: number,
  options?: UseSearchStorageGatePassOptions,
) {
  return useQuery({
    ...searchStorageGatePassQueryOptions(number),
    ...options,
  });
}
