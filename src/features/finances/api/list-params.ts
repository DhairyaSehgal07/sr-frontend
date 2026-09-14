import type { FinanceListParams } from './types';

export function buildFinanceListParams(
  params: FinanceListParams,
): Record<string, string> | undefined {
  const query: Record<string, string> = {};
  const billBookId = params.billBookId?.trim();

  if (billBookId) query.billBookId = billBookId;

  return Object.keys(query).length > 0 ? query : undefined;
}
