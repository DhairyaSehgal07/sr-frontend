import { queryOptions, useQuery } from '@tanstack/react-query';

import { getColdStoreStock } from './get-cold-store-stock';
import { coldStoreStockKeys } from './query-keys';

export function coldStoreStockQueryOptions() {
  return queryOptions({
    queryKey: coldStoreStockKeys.list(),
    queryFn: getColdStoreStock,
  });
}

export function useColdStoreStock() {
  return useQuery(coldStoreStockQueryOptions());
}
