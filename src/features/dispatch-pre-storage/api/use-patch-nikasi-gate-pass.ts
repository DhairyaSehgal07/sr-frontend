import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { patchNikasiGatePass } from './patch-nikasi-gate-pass';
import type { UpdateNikasiGatePassPatch } from './types';
import { nikasiGatePassKeys } from './types';

export function usePatchNikasiGatePass(id: string) {
  return useMutation({
    mutationKey: nikasiGatePassKeys.patch(id),
    mutationFn: (body: UpdateNikasiGatePassPatch) => patchNikasiGatePass(id, body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassKeys.detail(id),
      });
    },
  });
}
