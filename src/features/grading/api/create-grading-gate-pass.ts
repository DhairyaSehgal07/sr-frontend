import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';
import type { GradingQuantityRow } from '@/features/grading/schemas/grading-fill-details-schema';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { BagType } from '@/lib/constants';

import type {
  CreateGradingGatePassBody,
  CreateGradingGatePassInput,
  CreateGradingGatePassResponse,
  GradingOrderDetail,
} from './types';

function isBagType(value: string): value is BagType {
  return value === 'JUTE' || value === 'LENO';
}

export function activeQuantityRows(
  quantities: readonly GradingQuantityRow[],
): GradingQuantityRow[] {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

export function formQuantitiesToOrderDetails(
  quantities: GradingFormValues['quantities'],
): GradingOrderDetail[] {
  return activeQuantityRows(quantities).map((row) => ({
    size: row.size,
    bagType: isBagType(row.bagType) ? row.bagType : 'JUTE',
    quantity: row.qty ?? 0,
    weightPerBagKg: row.weight ?? 0,
  }));
}

export function toCreateGradingGatePassBody({
  form,
  gatePassNo,
}: CreateGradingGatePassInput): CreateGradingGatePassBody {
  const body: CreateGradingGatePassBody = {
    farmerStorageLinkId: form.farmerStorageLinkId,
    incomingGatePassIds: form.selectedIncomingGatePassIds,
    gatePassNo,
    date: form.date,
    variety: form.variety,
    orderDetails: formQuantitiesToOrderDetails(form.quantities),
  };

  if (form.manualGatePassNumber != null) {
    body.manualGatePassNumber = form.manualGatePassNumber;
  }

  const remarks = form.remarks.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  return body;
}

export async function createGradingGatePass(
  input: CreateGradingGatePassInput,
): Promise<CreateGradingGatePassResponse> {
  try {
    const { data } = await apiClient.post<CreateGradingGatePassResponse>(
      '/grading-gate-pass/',
      toCreateGradingGatePassBody(input),
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to create grading gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create grading gate pass'), {
      cause: error,
    });
  }
}
