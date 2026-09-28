import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { isDirectSaleOutgoing } from '@/lib/constants';

import type {
  UpdateOutgoingGatePassBody,
  UpdateOutgoingGatePassInput,
  UpdateOutgoingGatePassResponse,
} from './types';

export function toUpdateOutgoingGatePassBody(
  form: UpdateOutgoingGatePassInput['form'],
): UpdateOutgoingGatePassBody {
  const body: UpdateOutgoingGatePassBody = {
    date: form.date,
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    category: form.category.trim(),
  };

  if (isDirectSaleOutgoing(form.category)) {
    body.from = form.from.trim();
    body.to = form.to.trim();
    body.truckNumber = form.truckNumber.trim();
    body.transportCompany = form.transportCompany.trim();
    body.LSNumber = form.LSNumber.trim();
    body.driverName = form.driverName.trim();
    body.driverMobile = form.driverMobile.trim();
    body.owner = form.owner.trim();
    body.billNumber = Number(form.billNumber);
    body.biltiNumber = Number(form.biltiNumber);
    body.billBook = form.billBook.trim();
    body.biltiBook = form.biltiBook.trim();
  } else {
    body.from = null;
    body.to = null;
    body.truckNumber = null;
    body.transportCompany = null;
    body.LSNumber = null;
    body.driverName = null;
    body.driverMobile = null;
    body.owner = null;
    body.billNumber = null;
    body.biltiNumber = null;
    body.billBook = null;
    body.biltiBook = null;
  }

  const remarks = form.remarks.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  return body;
}

export async function updateOutgoingGatePass({
  id,
  form,
}: UpdateOutgoingGatePassInput): Promise<UpdateOutgoingGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateOutgoingGatePassResponse>(
      `/outgoing-gate-pass/${id}`,
      toUpdateOutgoingGatePassBody(form),
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to update outgoing gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update outgoing gate pass'), {
      cause: error,
    });
  }
}
