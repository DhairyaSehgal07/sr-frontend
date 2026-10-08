export const ledgerQueryKeys = {
  all: ['ledgers'] as const,
  dispatchLedgers: () => [...ledgerQueryKeys.all, 'dispatch-ledgers'] as const,
  createDispatchLedger: () => [...ledgerQueryKeys.dispatchLedgers(), 'create'] as const,
};
