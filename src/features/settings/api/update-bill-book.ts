import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { UpdateBillBookInput, UpdateBillBookResponse } from './types';

export async function updateBillBook({
  id,
  body,
}: UpdateBillBookInput): Promise<UpdateBillBookResponse> {
  try {
    const { data } = await apiClient.put<UpdateBillBookResponse>(`/bill-book/${id}`, body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update bill book');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update bill book'), { cause: error });
  }
}
