import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { createFinanceRecovery } from './create-finance-recovery';
import { financeKeys } from './query-keys';
import type { CreateFinanceRecoveryBody } from './types';

export function useCreateFinanceRecovery() {
  return useMutation({
    mutationKey: financeKeys.createRecovery(),
    mutationFn: (body: CreateFinanceRecoveryBody) => createFinanceRecovery(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: financeKeys.all,
      });
    },
  });
}
