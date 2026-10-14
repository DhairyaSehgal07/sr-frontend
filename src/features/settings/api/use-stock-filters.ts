import { queryOptions, useQuery } from '@tanstack/react-query';

import { getStockFilters } from './get-stock-filters';
import { stockFilterKeys } from './stock-filter-keys';

export function stockFiltersQueryOptions() {
  return queryOptions({
    queryKey: stockFilterKeys.list(),
    queryFn: getStockFilters,
  });
}

export function useStockFilters() {
  return useQuery(stockFiltersQueryOptions());
}
