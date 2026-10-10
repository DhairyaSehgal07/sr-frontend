import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { PatchNikasiGatePassResponse, UpdateNikasiGatePassPatch } from './types';

export async function patchNikasiGatePass(
  id: string,
  body: UpdateNikasiGatePassPatch,
): Promise<PatchNikasiGatePassResponse> {
  try {
    const { data } = await apiClient.put<PatchNikasiGatePassResponse>(
      `/nikasi-gate-pass/${id}`,
      body,
    );

    if (data.status != null && data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to update nikasi gate pass');
    }

    if (data.success === false) {
      throw new Error(data.message ?? 'Failed to update nikasi gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update nikasi gate pass'), {
      cause: error,
    });
  }
}
