import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { BillBook, BillBookListParams, GetBillBooksResponse } from './types';

export function buildBillBookListParams(
  params: BillBookListParams,
): Record<string, string> | undefined {
  const query: Record<string, string> = {};
  const search = params.search?.trim();

  if (search) query.search = search;
  if (params.isActive) query.isActive = params.isActive;

  return Object.keys(query).length > 0 ? query : undefined;
}

export async function getBillBooks(params: BillBookListParams = {}): Promise<BillBook[]> {
  try {
    const { data } = await apiClient.get<GetBillBooksResponse>('/bill-book', {
      params: buildBillBookListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load bill books');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load bill books'), { cause: error });
  }
}
