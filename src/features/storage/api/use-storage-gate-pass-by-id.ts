import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { findStorageGatePassInCache } from './find-storage-gate-pass-in-cache';
import { useStorageGatePasses } from './use-storage-gate-passes';
import type { StorageGatePass } from './types';

const FALLBACK_LIST_PARAMS = {
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

export function useStorageGatePassById(id: string) {
  const queryClient = useQueryClient();

  const cachedGatePass = useMemo(
    () => findStorageGatePassInCache(queryClient, id),
    [queryClient, id],
  );

  const fallbackQuery = useStorageGatePasses(FALLBACK_LIST_PARAMS, {
    enabled: cachedGatePass == null,
  });

  const fetchedGatePass = useMemo(
    () => fallbackQuery.data?.storageGatePasses.find((pass) => pass._id === id),
    [fallbackQuery.data, id],
  );

  const gatePass: StorageGatePass | null = cachedGatePass ?? fetchedGatePass ?? null;

  return {
    gatePass,
    isLoading: cachedGatePass == null && fallbackQuery.isLoading,
    isError: cachedGatePass == null && fallbackQuery.isError,
    error: cachedGatePass == null ? fallbackQuery.error : null,
    isFromCache: cachedGatePass != null,
  };
}
