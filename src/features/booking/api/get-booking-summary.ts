import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { SummaryResponse, SummaryVariety } from './summary-types';

export async function getBookingSummary(): Promise<SummaryVariety[]> {
  try {
    const { data } = await apiClient.get<SummaryResponse>('/booking/booking-summary');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load booking summary');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load booking summary'), {
      cause: error,
    });
  }
}
