import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { gradingGatePassKeys } from '@/features/grading/api/query-keys';
import type { UpdateGradingGatePassInput } from '@/features/grading/api/types';
import { updateGradingGatePass } from '@/features/grading/api/update-grading-gate-pass';
import { incomingGatePassKeys } from '@/features/incoming/api/query-keys';
import { queryClient } from '@/lib/queryClient';

export function useUpdateGradingGatePass(id: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: gradingGatePassKeys.update(id),
    mutationFn: (input: UpdateGradingGatePassInput) => updateGradingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: gradingGatePassKeys.detail(id),
      });
      void queryClient.invalidateQueries({
        queryKey: gradingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: gradingGatePassKeys.searches(),
      });
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.byFarmerLists(),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'grading' } });
    },
  });
}
