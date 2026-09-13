import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { CreateTemperatureRecordBody, CreateTemperatureRecordResponse } from './types';

export async function createTemperatureRecord(
  body: CreateTemperatureRecordBody,
): Promise<CreateTemperatureRecordResponse> {
  try {
    const { data } = await apiClient.post<CreateTemperatureRecordResponse>('/temperature', body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to create temperature record');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create temperature record'), {
      cause: error,
    });
  }
}
