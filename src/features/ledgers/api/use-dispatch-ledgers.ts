import { queryOptions, useQuery } from '@tanstack/react-query';

import { getDispatchLedgers } from './get-dispatch-ledgers';
import { ledgerQueryKeys } from './query-keys';

export function dispatchLedgersQueryOptions() {
  return queryOptions({
    queryKey: ledgerQueryKeys.dispatchLedgers(),
    queryFn: getDispatchLedgers,
  });
}

export function useDispatchLedgers() {
  return useQuery(dispatchLedgersQueryOptions());
}
