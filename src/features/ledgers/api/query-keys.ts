import type { FinanceListParams } from '@/features/finances/api/types';

export const ledgerQueryKeys = {
  all: ['ledgers'] as const,
  dispatchLedgers: () => [...ledgerQueryKeys.all, 'dispatch-ledgers'] as const,
  createDispatchLedger: () => [...ledgerQueryKeys.dispatchLedgers(), 'create'] as const,
  dispatchLedgerFinance: (id: string, params: FinanceListParams) =>
    [...ledgerQueryKeys.all, 'dispatch-ledger-finance', id, params] as const,
  dispatchLedgerGatePasses: (id: string) =>
    [...ledgerQueryKeys.all, 'dispatch-ledger-gate-passes', id] as const,
};
