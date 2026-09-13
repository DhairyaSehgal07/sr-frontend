import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { createGradingGatePass } from '@/features/grading/api/create-grading-gate-pass';
import { gradingGatePassKeys } from '@/features/grading/api/query-keys';
import type { CreateGradingGatePassInput } from '@/features/grading/api/types';
import { incomingGatePassKeys } from '@/features/incoming/api/query-keys';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

export function useCreateGradingGatePass() {
  const router = useRouter();

  return useMutation({
    mutationKey: gradingGatePassKeys.create(),
    mutationFn: (input: CreateGradingGatePassInput) => createGradingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: gradingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.byFarmerLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('grading-gate-pass'),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'grading' } });
    },
  });
}
