import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { UpdateTemperatureRecordInput, UpdateTemperatureRecordResponse } from './types';

export async function updateTemperatureRecord({
  id,
  body,
}: UpdateTemperatureRecordInput): Promise<UpdateTemperatureRecordResponse> {
  try {
    const { data } = await apiClient.put<UpdateTemperatureRecordResponse>(
      `/temperature/${id}`,
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update temperature record');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update temperature record'), {
      cause: error,
    });
  }
}
