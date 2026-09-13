import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { storageGatePassKeys } from '@/features/storage/api/query-keys';
import type { UpdateStorageGatePassInput } from '@/features/storage/api/types';
import { updateStorageGatePass } from '@/features/storage/api/update-storage-gate-pass';
import { queryClient } from '@/lib/queryClient';

export function useUpdateStorageGatePass(id: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: storageGatePassKeys.update(id),
    mutationFn: (input: UpdateStorageGatePassInput) => updateStorageGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.byFarmerLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.searches(),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'storage' } });
    },
  });
}
