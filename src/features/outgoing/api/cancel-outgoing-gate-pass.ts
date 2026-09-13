import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { CancelOutgoingGatePassInput, CancelOutgoingGatePassResponse } from './types';

export async function cancelOutgoingGatePass({
  id,
  cancellationRemarks,
}: CancelOutgoingGatePassInput): Promise<CancelOutgoingGatePassResponse> {
  const trimmedRemarks = cancellationRemarks.trim();

  if (!trimmedRemarks) {
    throw new Error('Cancellation remarks are required');
  }

  try {
    const { data } = await apiClient.post<CancelOutgoingGatePassResponse>(
      `/outgoing-gate-pass/${id}/cancel`,
      { cancellationRemarks: trimmedRemarks },
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to cancel outgoing gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to cancel outgoing gate pass'), {
      cause: error,
    });
  }
}
