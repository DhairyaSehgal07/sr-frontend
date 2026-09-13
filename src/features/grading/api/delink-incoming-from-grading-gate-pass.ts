import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  GradingIncomingGatePassLinkInput,
  GradingIncomingGatePassLinkResponse,
} from './types';

export async function delinkIncomingFromGradingGatePass({
  gradingGatePassId,
  incomingGatePassId,
}: GradingIncomingGatePassLinkInput): Promise<GradingIncomingGatePassLinkResponse> {
  try {
    const { data } = await apiClient.post<GradingIncomingGatePassLinkResponse>(
      `/grading-gate-pass/${gradingGatePassId}/incoming-gate-pass/delink`,
      { incomingGatePassId },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to delink incoming gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delink incoming gate pass'), {
      cause: error,
    });
  }
}
