import type { Booking, BookingGatePassBagSize } from '@/features/booking/api/types';
import {
  createDefaultBookingQuantities,
  createEmptyBookingQuantityRow,
  isBookingPaymentMode,
  type BookingFormValues,
  type BookingQuantityRow,
} from '@/features/booking/schemas/booking-form-schema';
import { BAG_SIZES } from '@/lib/constants';

function toIsoDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

function toBagSize(value: string): BookingQuantityRow['size'] {
  return BAG_SIZES.some((size) => size === value) ? (value as BookingQuantityRow['size']) : '';
}

function toQuantityRow(bagSize: BookingGatePassBagSize, isExtra: boolean): BookingQuantityRow {
  return {
    size: toBagSize(bagSize.size),
    isExtra,
    variety: bagSize.variety,
    qty: bagSize.currentQuantity,
    costPerBag: bagSize.costPerBag,
  };
}

export function bookingBagSizesToFormQuantities(
  bagSizes: readonly BookingGatePassBagSize[],
): BookingFormValues['quantities'] {
  const rows = createDefaultBookingQuantities();
  const filledDefaultSizes = new Set<string>();

  for (const bagSize of bagSizes) {
    const defaultIndex = rows.findIndex(
      (row) => !row.isExtra && row.size === bagSize.size && !filledDefaultSizes.has(row.size),
    );

    if (defaultIndex >= 0) {
      rows[defaultIndex] = toQuantityRow(bagSize, false);
      filledDefaultSizes.add(rows[defaultIndex].size);
      continue;
    }

    rows.push({
      ...createEmptyBookingQuantityRow(),
      ...toQuantityRow(bagSize, true),
    });
  }

  return rows;
}

export function bookingToFormValues(booking: Booking): BookingFormValues {
  return {
    manualGatePassNumber: booking.manualGatePassNumber,
    dispatchLedgerId: booking.dispatchLedgerId._id,
    billBookId: booking.billBookId ?? '',
    date: toIsoDateTime(booking.date),
    expectedDateOfDelivery: booking.expectedDateOfDelivery
      ? toIsoDateTime(booking.expectedDateOfDelivery)
      : undefined,
    bank: booking.bank ?? '',
    modeOfPayment:
      booking.modeOfPayment && isBookingPaymentMode(booking.modeOfPayment)
        ? booking.modeOfPayment
        : undefined,
    quantities: bookingBagSizesToFormQuantities(booking.bagSizes),
    remarks: booking.remarks ?? '',
  };
}
