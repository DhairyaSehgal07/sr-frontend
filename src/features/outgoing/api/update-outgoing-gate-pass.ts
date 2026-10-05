import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { isDirectSaleOutgoing } from '@/lib/constants';

import type {
  UpdateOutgoingGatePassBody,
  UpdateOutgoingGatePassInput,
  UpdateOutgoingGatePassResponse,
} from './types';

function nullableTrimmed(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullablePositiveAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function nullablePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function toUpdateOutgoingGatePassBody(
  form: UpdateOutgoingGatePassInput['form'],
): UpdateOutgoingGatePassBody {
  const body: UpdateOutgoingGatePassBody = {
    date: form.date,
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    category: form.category.trim(),
    shed: nullableTrimmed(form.shed),
  };

  if (isDirectSaleOutgoing(form.category)) {
    body.from = nullableTrimmed(form.from);
    body.to = nullableTrimmed(form.to);
    body.truckNumber = nullableTrimmed(form.truckNumber);
    body.transportCompany = nullableTrimmed(form.transportCompany);
    body.LSNumber = nullableTrimmed(form.LSNumber);
    body.driverName = nullableTrimmed(form.driverName);
    body.driverMobile = nullableTrimmed(form.driverMobile);
    body.owner = nullableTrimmed(form.owner);
    body.billNumber = nullablePositiveInt(form.billNumber);
    body.biltiNumber = nullablePositiveInt(form.biltiNumber);
    body.billBook = nullableTrimmed(form.billBook);
    body.biltiBook = nullableTrimmed(form.biltiBook);
    body.costPerBag = nullablePositiveAmount(form.costPerBag);
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
    body.costPerBag = null;
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
