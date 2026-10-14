import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { deleteStockFilter } from './delete-stock-filter';
import { stockFilterKeys } from './stock-filter-keys';

export function useDeleteStockFilter() {
  return useMutation({
    mutationKey: stockFilterKeys.remove(),
    mutationFn: (id: string) => deleteStockFilter(id),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockFilterKeys.lists() });
    },
  });
}
