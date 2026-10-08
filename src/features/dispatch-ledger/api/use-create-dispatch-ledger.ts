import { useMutation } from '@tanstack/react-query';

import { createDispatchLedger } from '@/features/dispatch-ledger/api/create-dispatch-ledger';
import { dispatchLedgerQueryKeys } from '@/features/dispatch-ledger/api/query-keys';
import type { AddDispatchLedgerPayload } from '@/features/dispatch-ledger/schemas/add-dispatch-ledger-form-schema';
import { queryClient } from '@/lib/queryClient';

export function useCreateDispatchLedger() {
  return useMutation({
    mutationKey: dispatchLedgerQueryKeys.create(),
    mutationFn: (payload: AddDispatchLedgerPayload) => createDispatchLedger(payload),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dispatchLedgerQueryKeys.lists(),
      });
    },
  });
}
