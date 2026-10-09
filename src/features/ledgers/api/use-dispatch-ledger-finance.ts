import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { FinanceListParams } from '@/features/finances/api/types';

import { getDispatchLedgerFinance } from './get-dispatch-ledger-finance';
import { ledgerQueryKeys } from './query-keys';

export function useDispatchLedgerFinance(id: string, params: FinanceListParams = {}) {
  return useQuery({
    queryKey: ledgerQueryKeys.dispatchLedgerFinance(id, params),
    queryFn: () => getDispatchLedgerFinance(id, params),
    enabled: id.length > 0,
    placeholderData: keepPreviousData,
  });
}
