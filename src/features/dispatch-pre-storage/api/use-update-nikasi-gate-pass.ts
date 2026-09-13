import { useMutation } from '@tanstack/react-query';

import type { DispatchPreStorageSummaryValues } from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';
import { queryClient } from '@/lib/queryClient';

import { updateNikasiGatePass } from './update-nikasi-gate-pass';
import { nikasiGatePassKeys } from './types';

type UpdateNikasiGatePassMutationInput = {
  id: string;
  summaryValues: DispatchPreStorageSummaryValues;
  isBooked: boolean;
};

export function useUpdateNikasiGatePass(id: string) {
  return useMutation({
    mutationKey: nikasiGatePassKeys.update(id),
    mutationFn: (input: UpdateNikasiGatePassMutationInput) => updateNikasiGatePass(input),
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
