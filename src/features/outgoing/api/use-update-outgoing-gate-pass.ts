import { useMutation } from '@tanstack/react-query';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { queryClient } from '@/lib/queryClient';

import { outgoingGatePassKeys } from './query-keys';
import type { UpdateOutgoingGatePassInput } from './types';
import { updateOutgoingGatePass } from './update-outgoing-gate-pass';

export function useUpdateOutgoingGatePass(id: string) {
  return useMutation({
    mutationKey: outgoingGatePassKeys.update(id),
    mutationFn: (input: UpdateOutgoingGatePassInput) => updateOutgoingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: outgoingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: daybookKeys.lists(),
      });
    },
  });
}
