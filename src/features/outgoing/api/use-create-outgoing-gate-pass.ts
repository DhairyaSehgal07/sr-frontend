import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { storageGatePassKeys } from '@/features/storage/api/query-keys';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

import { createOutgoingGatePass } from './create-outgoing-gate-pass';
import { outgoingGatePassKeys } from './query-keys';
import type { CreateOutgoingGatePassInput } from './types';

export function useCreateOutgoingGatePass() {
  const router = useRouter();

  return useMutation({
    mutationKey: outgoingGatePassKeys.create(),
    mutationFn: (input: CreateOutgoingGatePassInput) => createOutgoingGatePass(input),
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
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('outgoing-gate-pass'),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'storage' } });
    },
  });
}
