import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { DispatchLedger, DispatchLedgersResponse } from '../types';

export async function getDispatchLedgers(): Promise<DispatchLedger[]> {
  try {
    const { data } = await apiClient.get<DispatchLedgersResponse>('/dispatch-ledger');

    if (!data.success) {
      throw new Error('Failed to load dispatch ledgers');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load dispatch ledgers'), { cause: error });
  }
}
