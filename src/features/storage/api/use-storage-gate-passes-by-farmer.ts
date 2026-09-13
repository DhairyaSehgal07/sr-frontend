import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getStorageGatePassesByFarmer } from './get-storage-gate-passes-by-farmer';
import { storageGatePassKeys } from './query-keys';
import type { StorageGatePassesByFarmerParams, StorageGatePassesByFarmerResult } from './types';

const DEFAULT_PARAMS: StorageGatePassesByFarmerParams = {
  sortOrder: 'desc',
};

export function storageGatePassesByFarmerQueryOptions(
  farmerStorageLinkId: string,
  params: StorageGatePassesByFarmerParams = DEFAULT_PARAMS,
) {
  return queryOptions({
    queryKey: storageGatePassKeys.byFarmer(farmerStorageLinkId, params),
    queryFn: () => getStorageGatePassesByFarmer(farmerStorageLinkId, params),
    placeholderData: keepPreviousData,
    enabled: farmerStorageLinkId.trim().length > 0,
  });
}

type UseStorageGatePassesByFarmerOptions = Omit<
  UseQueryOptions<
    StorageGatePassesByFarmerResult,
    Error,
    StorageGatePassesByFarmerResult,
    ReturnType<typeof storageGatePassKeys.byFarmer>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useStorageGatePassesByFarmer(
  farmerStorageLinkId: string,
  params: StorageGatePassesByFarmerParams = DEFAULT_PARAMS,
  options?: UseStorageGatePassesByFarmerOptions,
) {
  return useQuery({
    ...storageGatePassesByFarmerQueryOptions(farmerStorageLinkId, params),
    ...options,
  });
}
