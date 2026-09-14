import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { BillBook, GetBillBookByIdResponse } from './types';

export async function getBillBookById(id: string): Promise<BillBook> {
  try {
    const { data } = await apiClient.get<GetBillBookByIdResponse>(`/bill-book/${id}`);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load bill book');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load bill book'), { cause: error });
  }
}
