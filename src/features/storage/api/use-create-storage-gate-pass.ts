import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { createStorageGatePass } from '@/features/storage/api/create-storage-gate-pass';
import { storageGatePassKeys } from '@/features/storage/api/query-keys';
import type { CreateStorageGatePassInput } from '@/features/storage/api/types';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

export function useCreateStorageGatePass() {
  const router = useRouter();

  return useMutation({
    mutationKey: storageGatePassKeys.create(),
    mutationFn: (input: CreateStorageGatePassInput) => createStorageGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: daybookKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('storage-gate-pass'),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'storage' } });
    },
  });
}
