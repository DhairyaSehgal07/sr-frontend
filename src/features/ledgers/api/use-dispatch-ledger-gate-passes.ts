import { useQuery } from '@tanstack/react-query';

import { getDispatchLedgerGatePasses } from './get-dispatch-ledger-gate-passes';
import { ledgerQueryKeys } from './query-keys';

export function useDispatchLedgerGatePasses(id: string) {
  return useQuery({
    queryKey: ledgerQueryKeys.dispatchLedgerGatePasses(id),
    queryFn: () => getDispatchLedgerGatePasses(id),
    enabled: id.length > 0,
  });
}
