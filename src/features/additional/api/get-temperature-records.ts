import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { GetTemperatureRecordsResponse, TemperatureRecord } from './types';

export async function getTemperatureRecords(): Promise<TemperatureRecord[]> {
  try {
    const { data } = await apiClient.get<GetTemperatureRecordsResponse>('/temperature');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load temperature records');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load temperature records'), {
      cause: error,
    });
  }
}
