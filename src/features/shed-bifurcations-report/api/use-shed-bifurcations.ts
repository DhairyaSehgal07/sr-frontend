import { queryOptions, useQuery } from '@tanstack/react-query';

import { getShedBifurcations } from './get-shed-bifurcations';
import { shedBifurcationKeys } from './query-keys';
import type { ShedBifurcationParams } from './types';

export function shedBifurcationsQueryOptions(params: ShedBifurcationParams) {
  return queryOptions({
    queryKey: shedBifurcationKeys.list(params),
    queryFn: () => getShedBifurcations(params),
  });
}

export function useShedBifurcations(params: ShedBifurcationParams = {}) {
  return useQuery(shedBifurcationsQueryOptions(params));
}
