import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getNikasiGatePassById } from './get-nikasi-gate-pass-by-id';
import type { NikasiGatePass } from './types';
import { nikasiGatePassKeys } from './types';

export function nikasiGatePassByIdQueryOptions(id: string) {
  return {
    queryKey: nikasiGatePassKeys.detail(id),
    queryFn: () => getNikasiGatePassById(id),
  };
}

type UseNikasiGatePassByIdOptions = Omit<
  UseQueryOptions<NikasiGatePass | null, Error>,
  'queryKey' | 'queryFn'
>;

export function useNikasiGatePassById(id: string, options?: UseNikasiGatePassByIdOptions) {
  return useQuery({
    ...nikasiGatePassByIdQueryOptions(id),
    ...options,
  });
}
