import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { createIncomingGatePass } from '@/features/incoming/api/create-incoming-gate-pass';
import { incomingGatePassKeys } from '@/features/incoming/api/query-keys';
import type { CreateIncomingGatePassInput } from '@/features/incoming/api/types';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

export function useCreateIncomingGatePass() {
  const router = useRouter();

  return useMutation({
    mutationKey: incomingGatePassKeys.create(),
    mutationFn: (input: CreateIncomingGatePassInput) => createIncomingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('incoming-gate-pass'),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'incoming' } });
    },
  });
}
