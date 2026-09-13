import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { outgoingGatePassKeys } from '@/features/outgoing/api/query-keys';
import { storageGatePassKeys } from '@/features/storage/api/query-keys';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

import { createTransferStock } from './create-transfer-stock';
import { TRANSFER_STOCK_VOUCHER_TYPE } from './voucher-type';
import { transferStockKeys } from './query-keys';
import type { CreateTransferStockInput } from './types';

export function useCreateTransferStock() {
  const router = useRouter();

  return useMutation({
    mutationKey: transferStockKeys.create(),
    mutationFn: (input: CreateTransferStockInput) => createTransferStock(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: transferStockKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: daybookKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: storageGatePassKeys.byFarmerLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: outgoingGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail(TRANSFER_STOCK_VOUCHER_TYPE),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'storage' } });
    },
  });
}
