import { queryOptions, useQuery } from '@tanstack/react-query';

import { getDispatchLedgers } from './get-dispatch-ledgers';
import { peopleQueryKeys } from './query-keys';

export function dispatchLedgersQueryOptions() {
  return queryOptions({
    queryKey: peopleQueryKeys.dispatchLedgers(),
    queryFn: getDispatchLedgers,
  });
}

export function useDispatchLedgers() {
  return useQuery(dispatchLedgersQueryOptions());
}
