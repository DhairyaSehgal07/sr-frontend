import { queryOptions, useQuery } from '@tanstack/react-query';

import { getDispatchLedgers } from './get-dispatch-ledgers';
import { dispatchLedgerQueryKeys } from './query-keys';

export function dispatchLedgersQueryOptions() {
  return queryOptions({
    queryKey: dispatchLedgerQueryKeys.lists(),
    queryFn: getDispatchLedgers,
  });
}

export function useDispatchLedgers() {
  return useQuery(dispatchLedgersQueryOptions());
}
