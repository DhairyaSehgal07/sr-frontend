import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { deleteColdStoreStock } from './delete-cold-store-stock';
import { coldStoreStockKeys } from './query-keys';

export function useDeleteColdStoreStock() {
  return useMutation({
    mutationKey: coldStoreStockKeys.remove(),
    mutationFn: (id: string) => deleteColdStoreStock(id),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coldStoreStockKeys.lists() });
    },
  });
}
