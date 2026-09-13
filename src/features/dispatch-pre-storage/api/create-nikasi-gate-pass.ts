import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { CreateNikasiGatePassBody, CreateNikasiGatePassResponse } from './types';

function assertCreateNikasiGatePassResponse(data: CreateNikasiGatePassResponse): void {
  if (data.success === false) {
    throw new Error(data.message ?? 'Failed to create nikasi gate pass');
  }
}

export async function createNikasiGatePass(
  body: CreateNikasiGatePassBody,
): Promise<CreateNikasiGatePassResponse> {
  try {
    const { data } = await apiClient.post<CreateNikasiGatePassResponse>('/nikasi-gate-pass', body);

    assertCreateNikasiGatePassResponse(data);

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create nikasi gate pass'), {
      cause: error,
    });
  }
}
