import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { incomingGatePassKeys } from '@/features/incoming/api/query-keys';
import type { UpdateIncomingGatePassInput } from '@/features/incoming/api/types';
import { updateIncomingGatePass } from '@/features/incoming/api/update-incoming-gate-pass';
import { queryClient } from '@/lib/queryClient';

export function useUpdateIncomingGatePass(id: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: incomingGatePassKeys.update(id),
    mutationFn: (input: UpdateIncomingGatePassInput) => updateIncomingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: incomingGatePassKeys.searches(),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'incoming' } });
    },
  });
}
