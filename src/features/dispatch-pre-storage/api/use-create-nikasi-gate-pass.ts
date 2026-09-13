import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

import { createNikasiGatePass } from './create-nikasi-gate-pass';
import { nikasiGatePassKeys, type CreateNikasiGatePassBody } from './types';

export function useCreateNikasiGatePass() {
  const router = useRouter();

  return useMutation({
    mutationKey: nikasiGatePassKeys.create(),
    mutationFn: (body: CreateNikasiGatePassBody) => createNikasiGatePass(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('nikasi-gate-pass'),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'dispatch' } });
    },
  });
}
