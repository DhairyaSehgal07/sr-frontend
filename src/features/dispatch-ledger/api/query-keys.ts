export const dispatchLedgerQueryKeys = {
  all: ['dispatch-ledger'] as const,
  lists: () => [...dispatchLedgerQueryKeys.all, 'list'] as const,
  create: () => [...dispatchLedgerQueryKeys.lists(), 'create'] as const,
};
