import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { findIncomingGatePassInCache } from './find-incoming-gate-pass-in-cache';
import { useIncomingGatePasses } from './use-incoming-gate-passes';
import type { IncomingGatePass } from './types';

const FALLBACK_LIST_PARAMS = {
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

export function useIncomingGatePassById(id: string) {
  const queryClient = useQueryClient();

  const cachedGatePass = useMemo(
    () => findIncomingGatePassInCache(queryClient, id),
    [queryClient, id],
  );

  const fallbackQuery = useIncomingGatePasses(FALLBACK_LIST_PARAMS, {
    enabled: cachedGatePass == null,
  });

  const fetchedGatePass = useMemo(
    () => fallbackQuery.data?.incomingGatePasses.find((pass) => pass._id === id),
    [fallbackQuery.data, id],
  );

  const gatePass: IncomingGatePass | null = cachedGatePass ?? fetchedGatePass ?? null;

  return {
    gatePass,
    isLoading: cachedGatePass == null && fallbackQuery.isLoading,
    isError: cachedGatePass == null && fallbackQuery.isError,
    error: cachedGatePass == null ? fallbackQuery.error : null,
    isFromCache: cachedGatePass != null,
  };
}
