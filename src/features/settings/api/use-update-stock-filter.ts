import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { stockFilterKeys } from './stock-filter-keys';
import type { UpdateStockFilterInput } from './stock-filter-types';
import { updateStockFilter } from './update-stock-filter';

export function useUpdateStockFilter() {
  return useMutation({
    mutationKey: stockFilterKeys.update(),
    mutationFn: (input: UpdateStockFilterInput) => updateStockFilter(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockFilterKeys.lists() });
    },
  });
}
