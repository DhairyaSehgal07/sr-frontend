import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  CreateShedBifurcationInput,
  DeleteShedBifurcationInput,
  ListShedBifurcationsResponse,
  ShedBifurcationMutationResponse,
  ShedBifurcationRecord,
} from './types';

export async function getShedBifurcations(
  outgoingGatePassId: string,
): Promise<ShedBifurcationRecord[]> {
  try {
    const { data } = await apiClient.get<ListShedBifurcationsResponse>(
      `/outgoing-gate-pass/${outgoingGatePassId}/bifurcation`,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load shed bifurcations');
    }

    return data.data?.bifurcations ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load shed bifurcations'), {
      cause: error,
    });
  }
}

export async function createShedBifurcation({
  id,
  body,
}: CreateShedBifurcationInput): Promise<ShedBifurcationMutationResponse> {
  try {
    const { data } = await apiClient.post<ShedBifurcationMutationResponse>(
      `/outgoing-gate-pass/${id}/bifurcation`,
      body,
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to save shed bifurcation');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save shed bifurcation'), {
      cause: error,
    });
  }
}

export async function deleteShedBifurcation({
  id,
  bifurcationId,
}: DeleteShedBifurcationInput): Promise<ShedBifurcationMutationResponse> {
  try {
    const { data } = await apiClient.delete<ShedBifurcationMutationResponse>(
      `/outgoing-gate-pass/${id}/bifurcation/${bifurcationId}`,
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to remove shed bifurcation');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to remove shed bifurcation'), {
      cause: error,
    });
  }
}
