import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { createColdStoreStock } from './create-cold-store-stock';
import { coldStoreStockKeys } from './query-keys';
import type { ColdStoreStockBody } from './types';

export function useCreateColdStoreStock() {
  return useMutation({
    mutationKey: coldStoreStockKeys.create(),
    mutationFn: (body: ColdStoreStockBody) => createColdStoreStock(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coldStoreStockKeys.lists() });
    },
  });
}
