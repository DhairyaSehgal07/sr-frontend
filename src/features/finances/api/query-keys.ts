import type { FinanceListParams } from './types';

export const financeKeys = {
  all: ['finances'] as const,
  summaries: () => [...financeKeys.all, 'summary'] as const,
  summary: (params: FinanceListParams) => [...financeKeys.summaries(), params] as const,
  salesLists: () => [...financeKeys.all, 'sales'] as const,
  sales: (params: FinanceListParams) => [...financeKeys.salesLists(), params] as const,
  outstandingLists: () => [...financeKeys.all, 'outstanding'] as const,
  outstanding: (params: FinanceListParams) => [...financeKeys.outstandingLists(), params] as const,
  recoveriesLists: () => [...financeKeys.all, 'recoveries'] as const,
  recoveries: (params: FinanceListParams) => [...financeKeys.recoveriesLists(), params] as const,
  createRecovery: () => [...financeKeys.all, 'create-recovery'] as const,
};
