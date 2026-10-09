import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MarkNikasiGatePassNullResponse } from './types';

export async function markNikasiGatePassNull(
  id: string,
): Promise<MarkNikasiGatePassNullResponse> {
  try {
    const { data } = await apiClient.post<MarkNikasiGatePassNullResponse>(
      `/nikasi-gate-pass/${id}/mark-null`,
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to mark nikasi gate pass as null');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to mark nikasi gate pass as null'), {
      cause: error,
    });
  }
}
