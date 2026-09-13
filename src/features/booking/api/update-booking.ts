import type { BookingFormValues } from '@/features/booking/schemas/booking-form-schema';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { activeBookingQuantityRows } from './create-booking';
import type {
  BookingGatePassBagSize,
  UpdateBookingBody,
  UpdateBookingInput,
  UpdateBookingResponse,
} from './types';

export function formQuantitiesToUpdateBagSizes(
  quantities: BookingFormValues['quantities'],
  originalBagSizes: readonly BookingGatePassBagSize[],
): BookingGatePassBagSize[] {
  const initialByLine = new Map(
    originalBagSizes.map((bagSize) => [
      `${bagSize.size}\0${bagSize.variety}`,
      bagSize.initialQuantity,
    ]),
  );

  return activeBookingQuantityRows(quantities).map((row) => {
    const currentQuantity = row.qty ?? 0;
    const lineKey = `${row.size}\0${row.variety}`;

    return {
      size: row.size,
      variety: row.variety,
      currentQuantity,
      initialQuantity: initialByLine.get(lineKey) ?? currentQuantity,
    };
  });
}

export function toUpdateBookingBody({
  form,
  originalBagSizes,
}: Pick<UpdateBookingInput, 'form' | 'originalBagSizes'>): UpdateBookingBody {
  const bagSizes = formQuantitiesToUpdateBagSizes(form.quantities, originalBagSizes);

  if (bagSizes.length === 0) {
    throw new Error('Enter at least one bag quantity.');
  }

  const body: UpdateBookingBody = {
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    date: form.date,
    dispatchLedgerId: form.dispatchLedgerId,
    bagSizes,
  };

  body.remarks = form.remarks.trim();

  return body;
}

function assertUpdateBookingResponse(data: UpdateBookingResponse): void {
  if (data.success === false) {
    throw new Error(data.message ?? 'Failed to update booking gate pass');
  }
}

export async function updateBooking({
  id,
  form,
  originalBagSizes,
}: UpdateBookingInput): Promise<UpdateBookingResponse> {
  try {
    const { data } = await apiClient.put<UpdateBookingResponse>(
      `/booking/${id}`,
      toUpdateBookingBody({ form, originalBagSizes }),
    );

    assertUpdateBookingResponse(data);

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update booking gate pass'), {
      cause: error,
    });
  }
}
