import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { GetNikasiGatePassByIdResponse, NikasiGatePass } from './types';

export async function getNikasiGatePassById(id: string): Promise<NikasiGatePass | null> {
  try {
    const { data } = await apiClient.get<GetNikasiGatePassByIdResponse>(`/nikasi-gate-pass/${id}`);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load nikasi gate pass');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load nikasi gate pass'), { cause: error });
  }
}
