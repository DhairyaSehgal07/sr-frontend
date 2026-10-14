import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import { createStockFilter } from './create-stock-filter';
import { stockFilterKeys } from './stock-filter-keys';
import type { StockFilterBody } from './stock-filter-types';

export function useCreateStockFilter() {
  return useMutation({
    mutationKey: stockFilterKeys.create(),
    mutationFn: (body: StockFilterBody) => createStockFilter(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockFilterKeys.lists() });
    },
  });
}
