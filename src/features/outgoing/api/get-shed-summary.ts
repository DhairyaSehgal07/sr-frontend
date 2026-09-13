import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { mapShedSummaryToVarietySummary } from '@/features/outgoing/utils/map-shed-summary';

import type { ShedSummaryResponse } from './types';

export async function getShedSummary(): Promise<BookingVarietySummary[]> {
  try {
    const { data } = await apiClient.get<ShedSummaryResponse>('/outgoing-gate-pass/shed-summary');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load shed stock summary');
    }

    return mapShedSummaryToVarietySummary(data.data ?? []);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load shed stock summary'), {
      cause: error,
    });
  }
}
