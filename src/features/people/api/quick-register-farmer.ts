import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AddFarmerPayload } from '../schemas/add-farmer-form-schema';
import type { Farmer, FarmerStorageLink } from '../types';

/** Raw API payload from quick-register (nested farmer + link). */
export type QuickRegisterFarmerApiData = {
  farmer: Farmer;
  farmerStorageLink: FarmerStorageLink;
};

export type QuickRegisterFarmerBody = AddFarmerPayload & {
  coldStorageId: string;
  linkedById: string;
};

export interface QuickRegisterFarmerResponse {
  success: boolean;
  data: FarmerStorageLink | null;
  message: string;
}

export type QuickRegisterFarmerAuth = {
  coldStorageId: string;
  linkedById: string;
};

type QuickRegisterFarmerApiResponse = {
  success: boolean;
  data: QuickRegisterFarmerApiData | FarmerStorageLink | null;
  message: string;
};

export function normalizeQuickRegisterFarmerData(
  raw: QuickRegisterFarmerApiData | FarmerStorageLink | null | undefined,
): FarmerStorageLink | null {
  if (!raw) return null;

  if ('farmer' in raw && 'farmerStorageLink' in raw) {
    return {
      ...raw.farmerStorageLink,
      farmerId: raw.farmer,
    };
  }

  if (
    'farmerId' in raw &&
    raw.farmerId != null &&
    typeof raw.farmerId === 'object' &&
    'name' in raw.farmerId
  ) {
    return raw;
  }

  return null;
}

export function toQuickRegisterFarmerBody(
  payload: AddFarmerPayload,
  auth: QuickRegisterFarmerAuth,
): QuickRegisterFarmerBody {
  return {
    ...payload,
    coldStorageId: auth.coldStorageId,
    linkedById: auth.linkedById,
  };
}

export async function quickRegisterFarmer(
  payload: AddFarmerPayload,
  auth: QuickRegisterFarmerAuth,
): Promise<QuickRegisterFarmerResponse> {
  try {
    const { data } = await apiClient.post<QuickRegisterFarmerApiResponse>(
      '/farmer-storage-link/quick-register-farmer',
      toQuickRegisterFarmerBody(payload, auth),
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to add farmer');
    }

    const normalized = normalizeQuickRegisterFarmerData(data.data);

    return {
      success: data.success,
      message: data.message,
      data: normalized,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add farmer'), {
      cause: error,
    });
  }
}
