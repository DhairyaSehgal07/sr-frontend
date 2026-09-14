import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { CreateBillBookBody, CreateBillBookResponse } from './types';

export async function createBillBook(body: CreateBillBookBody): Promise<CreateBillBookResponse> {
  try {
    const { data } = await apiClient.post<CreateBillBookResponse>('/bill-book', body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to create bill book');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create bill book'), { cause: error });
  }
}
