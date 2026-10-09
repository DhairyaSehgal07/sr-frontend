import { buildFinanceListParams } from '@/features/finances/api/list-params';
import type { FinanceListParams } from '@/features/finances/api/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { DispatchLedgerFinanceDetail, DispatchLedgerFinanceResponse } from './types';

export async function getDispatchLedgerFinance(
  id: string,
  params: FinanceListParams = {},
): Promise<DispatchLedgerFinanceDetail | null> {
  try {
    const { data } = await apiClient.get<DispatchLedgerFinanceResponse>(`/finances/${id}`, {
      params: buildFinanceListParams(params),
    });

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to load dispatch ledger');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load dispatch ledger'), { cause: error });
  }
}
