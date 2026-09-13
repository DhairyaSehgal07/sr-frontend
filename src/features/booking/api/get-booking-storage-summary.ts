import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { SummaryResponse, SummaryVariety } from './summary-types';

export async function getBookingStorageSummary(): Promise<SummaryVariety[]> {
  try {
    const { data } = await apiClient.get<SummaryResponse>('/booking/booking-storage-summary');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load booking storage summary');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load booking storage summary'), {
      cause: error,
    });
  }
}
