import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { normalizeShedSummaryGroups } from '@/features/outgoing/utils/map-shed-summary';

import type { ShedSummaryGroup, ShedSummaryResponse } from './types';

export async function getShedSummary(): Promise<ShedSummaryGroup[]> {
  try {
    const { data } = await apiClient.get<ShedSummaryResponse>('/outgoing-gate-pass/shed-summary');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load shed stock summary');
    }

    return normalizeShedSummaryGroups(data.data ?? []);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load shed stock summary'), {
      cause: error,
    });
  }
}
