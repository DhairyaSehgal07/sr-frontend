import {
  keepPreviousData,
  queryOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { type StorageGatePassSearchKey, storageGatePassKeys } from './query-keys';
import { searchStorageGatePasses } from './search-storage-gate-passes';
import type { StorageGatePassSearchBy, StorageGatePassSearchResult } from './types';

const DEFAULT_SEARCH_BY: StorageGatePassSearchBy = 'gatePassNumber';

export function searchStorageGatePassQueryOptions(params: StorageGatePassSearchKey) {
  return queryOptions({
    queryKey: storageGatePassKeys.search(params),
    queryFn: () => searchStorageGatePasses(params),
    placeholderData: keepPreviousData,
  });
}

type UseSearchStorageGatePassOptions = Omit<
  UseQueryOptions<
    StorageGatePassSearchResult,
    Error,
    StorageGatePassSearchResult,
    ReturnType<typeof storageGatePassKeys.search>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useSearchStorageGatePass(
  number: number,
  searchBy: StorageGatePassSearchBy = DEFAULT_SEARCH_BY,
  options?: UseSearchStorageGatePassOptions,
) {
  return useQuery({
    ...searchStorageGatePassQueryOptions({ number, searchBy }),
    ...options,
  });
}
