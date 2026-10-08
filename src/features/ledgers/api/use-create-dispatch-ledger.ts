import { useMutation } from '@tanstack/react-query';

import { ledgerQueryKeys } from '@/features/ledgers/api/query-keys';
import { createDispatchLedger } from '@/features/ledgers/api/create-dispatch-ledger';
import type { AddDispatchLedgerPayload } from '@/features/ledgers/schemas/add-dispatch-ledger-form-schema';
import { queryClient } from '@/lib/queryClient';

export function useCreateDispatchLedger() {
  return useMutation({
    mutationKey: ledgerQueryKeys.createDispatchLedger(),
    mutationFn: (payload: AddDispatchLedgerPayload) => createDispatchLedger(payload),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ledgerQueryKeys.dispatchLedgers(),
      });
    },
  });
}
