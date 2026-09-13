import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getStorageGatePassEdits } from './get-storage-gate-pass-edits';
import { storageGatePassKeys } from './query-keys';
import type { StorageGatePassEditsListParams, StorageGatePassEditsListResult } from './types';

export function storageGatePassEditsQueryOptions(params: StorageGatePassEditsListParams) {
  return queryOptions({
    queryKey: storageGatePassKeys.edits(params),
    queryFn: () => getStorageGatePassEdits(params),
    placeholderData: keepPreviousData,
  });
}

type UseStorageGatePassEditsOptions = Omit<
  UseQueryOptions<
    StorageGatePassEditsListResult,
    Error,
    StorageGatePassEditsListResult,
    ReturnType<typeof storageGatePassKeys.edits>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useStorageGatePassEdits(
  params: StorageGatePassEditsListParams,
  options?: UseStorageGatePassEditsOptions,
) {
  return useQuery({
    ...storageGatePassEditsQueryOptions(params),
    ...options,
  });
}
