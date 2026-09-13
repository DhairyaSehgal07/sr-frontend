import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  FarmerStorageLinkGatePassesResult,
  GetFarmerStorageLinkGatePassesResponse,
} from './gate-pass-types';
import { normalizeFarmerStorageLinkGatePasses } from './normalize-farmer-storage-link-gate-passes';

export async function getFarmerStorageLinkGatePasses(
  farmerStorageLinkId: string,
): Promise<FarmerStorageLinkGatePassesResult> {
  try {
    const { data } = await apiClient.get<GetFarmerStorageLinkGatePassesResponse>(
      `/farmer-storage-link/${farmerStorageLinkId}/gate-passes`,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load gate passes');
    }

    return normalizeFarmerStorageLinkGatePasses(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load gate passes'), { cause: error });
  }
}
