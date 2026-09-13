import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { formQuantitiesToOrderDetails } from './create-grading-gate-pass';
import type {
  UpdateGradingGatePassBody,
  UpdateGradingGatePassInput,
  UpdateGradingGatePassResponse,
} from './types';

export function toUpdateGradingGatePassBody(form: GradingFormValues): UpdateGradingGatePassBody {
  const body: UpdateGradingGatePassBody = {
    variety: form.variety,
    date: form.date,
    orderDetails: formQuantitiesToOrderDetails(form.quantities),
  };

  if (form.manualGatePassNumber != null) {
    body.manualGatePassNumber = form.manualGatePassNumber;
  }

  body.remarks = form.remarks.trim();

  return body;
}

export async function updateGradingGatePass({
  id,
  form,
}: UpdateGradingGatePassInput): Promise<UpdateGradingGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateGradingGatePassResponse>(
      `/grading-gate-pass/${id}`,
      toUpdateGradingGatePassBody(form),
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update grading gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update grading gate pass'), {
      cause: error,
    });
  }
}
