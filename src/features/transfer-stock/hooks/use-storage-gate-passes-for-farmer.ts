import { useMemo } from 'react';

import { useStorageGatePassesByFarmer } from '@/features/storage/api/use-storage-gate-passes-by-farmer';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import { toTransferStorageGatePass } from '@/features/transfer-stock/utils/to-transfer-storage-gate-pass';

type UseStorageGatePassesForFarmerResult = {
  data: StorageGatePass[];
  isLoading: boolean;
  error: Error | null;
};

export function useStorageGatePassesForFarmer(
  farmerStorageLinkId: string,
): UseStorageGatePassesForFarmerResult {
  const { data, isLoading, isFetching, error } = useStorageGatePassesByFarmer(farmerStorageLinkId);

  const passes = useMemo(
    () => (data?.storageGatePasses ?? []).map(toTransferStorageGatePass),
    [data?.storageGatePasses],
  );

  return {
    data: passes,
    isLoading: isLoading || isFetching,
    error: error ?? null,
  };
}
