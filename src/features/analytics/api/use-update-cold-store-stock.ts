import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { coldStoreStockKeys } from './query-keys';
import type { UpdateColdStoreStockInput } from './types';
import { updateColdStoreStock } from './update-cold-store-stock';

export function useUpdateColdStoreStock() {
  return useMutation({
    mutationKey: coldStoreStockKeys.update(),
    mutationFn: (input: UpdateColdStoreStockInput) => updateColdStoreStock(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coldStoreStockKeys.lists() });
    },
  });
}
