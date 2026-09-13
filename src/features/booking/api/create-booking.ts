import type {
  BookingFormValues,
  BookingQuantityRow,
} from '@/features/booking/schemas/booking-form-schema';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  BookingGatePassBagSize,
  CreateBookingBody,
  CreateBookingInput,
  CreateBookingResponse,
} from './types';

export function activeBookingQuantityRows(
  quantities: readonly BookingQuantityRow[],
): BookingQuantityRow[] {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

export function formQuantitiesToBagSizes(
  quantities: BookingFormValues['quantities'],
): BookingGatePassBagSize[] {
  return activeBookingQuantityRows(quantities).map((row) => {
    const quantity = row.qty ?? 0;

    return {
      size: row.size,
      variety: row.variety,
      currentQuantity: quantity,
      initialQuantity: quantity,
    };
  });
}

export function toCreateBookingBody({ form, gatePassNo }: CreateBookingInput): CreateBookingBody {
  const bagSizes = formQuantitiesToBagSizes(form.quantities);

  if (bagSizes.length === 0) {
    throw new Error('Enter at least one bag quantity.');
  }

  const body: CreateBookingBody = {
    dispatchLedgerId: form.dispatchLedgerId,
    gatePassNo,
    date: form.date,
    bagSizes,
    idempotencyKey: crypto.randomUUID(),
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

function assertCreateBookingResponse(data: CreateBookingResponse): void {
  if (data.success === false) {
    throw new Error(data.message ?? 'Failed to create booking gate pass');
  }

  const status = data.status?.toLowerCase();
  if (status && status !== 'success' && status !== 'ok' && data.success !== true) {
    throw new Error(data.message ?? 'Failed to create booking gate pass');
  }
}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResponse> {
  const body = toCreateBookingBody(input);

  try {
    const { data } = await apiClient.post<CreateBookingResponse>('/booking', body);

    assertCreateBookingResponse(data);

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create booking gate pass'), {
      cause: error,
    });
  }
}
