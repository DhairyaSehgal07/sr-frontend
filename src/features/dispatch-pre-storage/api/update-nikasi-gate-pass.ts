import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import {
  buildUpdateApiBody,
  type DispatchPreStorageSummaryValues,
} from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';

import type { UpdateNikasiGatePassBody, UpdateNikasiGatePassResponse } from './types';

export function toUpdateNikasiGatePassBody(
  summaryValues: DispatchPreStorageSummaryValues,
  isBooked: boolean,
  options?: { requireStockFilter?: boolean },
): UpdateNikasiGatePassBody {
  return buildUpdateApiBody(summaryValues, isBooked, options);
}

export async function updateNikasiGatePass(input: {
  id: string;
  summaryValues: DispatchPreStorageSummaryValues;
  isBooked: boolean;
  requireStockFilter?: boolean;
}): Promise<UpdateNikasiGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateNikasiGatePassResponse>(
      `/nikasi-gate-pass/${input.id}`,
      toUpdateNikasiGatePassBody(input.summaryValues, input.isBooked, {
        requireStockFilter: input.requireStockFilter,
      }),
    );

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
