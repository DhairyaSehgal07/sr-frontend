import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AddDispatchLedgerPayload } from '../schemas/add-dispatch-ledger-form-schema';
import type { DispatchLedger } from '../types';

export interface CreateDispatchLedgerResponse {
  success: boolean;
  data: DispatchLedger | null;
  message: string;
}

export async function createDispatchLedger(
  payload: AddDispatchLedgerPayload,
): Promise<CreateDispatchLedgerResponse> {
  try {
    const { data } = await apiClient.post<CreateDispatchLedgerResponse>(
      '/dispatch-ledger',
      payload,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to add dispatch ledger');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add dispatch ledger'), { cause: error });
  }
}
