import { useMutation } from '@tanstack/react-query';

import { peopleQueryKeys } from '@/features/people/api/query-keys';
import { createDispatchLedger } from '@/features/people/api/create-dispatch-ledger';
import type { AddDispatchLedgerPayload } from '@/features/people/schemas/add-dispatch-ledger-form-schema';
import { queryClient } from '@/lib/queryClient';

export function useCreateDispatchLedger() {
  return useMutation({
    mutationKey: peopleQueryKeys.createDispatchLedger(),
    mutationFn: (payload: AddDispatchLedgerPayload) => createDispatchLedger(payload),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.dispatchLedgers(),
      });
    },
  });
}
