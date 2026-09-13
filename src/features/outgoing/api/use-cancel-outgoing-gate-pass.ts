import { useMutation } from '@tanstack/react-query';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { storageGatePassKeys } from '@/features/storage/api/query-keys';
import { queryClient } from '@/lib/queryClient';

import { cancelOutgoingGatePass } from './cancel-outgoing-gate-pass';
import { outgoingGatePassKeys } from './query-keys';
import type { CancelOutgoingGatePassInput } from './types';

export function useCancelOutgoingGatePass() {
  return useMutation({
    mutationKey: outgoingGatePassKeys.cancel(),
    mutationFn: (input: CancelOutgoingGatePassInput) => cancelOutgoingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outgoingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: daybookKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.byFarmerLists(),
      });
    },
  });
}
