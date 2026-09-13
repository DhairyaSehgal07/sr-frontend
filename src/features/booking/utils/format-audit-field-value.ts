import type {
  BookingAuditState,
  BookingDispatchLedger,
  BookingGatePassBagSize,
} from '@/features/booking/api/types';

export const BOOKING_AUDIT_FIELD_LABELS: Record<keyof BookingAuditState, string> = {
  manualGatePassNumber: 'Manual #',
  date: 'Date',
  dispatchLedgerId: 'Dispatch ledger',
  bagSizes: 'Bag sizes',
  remarks: 'Remarks',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatAuditDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatQuantity(value: number) {
  return `${formatNumber(value)} bags`;
}

function formatDispatchLedger(value: BookingDispatchLedger | string) {
  if (typeof value === 'string') return value;

  const mobileNumber = value.mobileNumber ? ` · ${value.mobileNumber}` : '';

  return `${value.name}${mobileNumber}`;
}

function formatBagSize(row: BookingGatePassBagSize) {
  return `${row.size} · ${row.variety} · current ${formatQuantity(row.currentQuantity)} / initial ${formatQuantity(row.initialQuantity)}`;
}

function formatBagSizes(value: BookingGatePassBagSize[]) {
  if (value.length === 0) return '-';

  return value.map(formatBagSize).join('; ');
}

export function formatAuditFieldValue(field: keyof BookingAuditState, value: unknown): string {
  if (value == null || value === '') return '-';

  switch (field) {
    case 'manualGatePassNumber':
      return typeof value === 'number' ? formatNumber(value) : String(value);
    case 'date':
      return typeof value === 'string' ? formatAuditDate(value) : String(value);
    case 'dispatchLedgerId':
      return typeof value === 'object' && value != null
        ? formatDispatchLedger(value as BookingDispatchLedger | string)
        : String(value);
    case 'bagSizes':
      return Array.isArray(value)
        ? formatBagSizes(value as BookingGatePassBagSize[])
        : String(value);
    default:
      return String(value);
  }
}

export function getBookingAuditChangedFields(
  previousState: BookingAuditState,
  modifiedState: BookingAuditState,
): Array<keyof BookingAuditState> {
  const keys = new Set([
    ...(Object.keys(previousState) as Array<keyof BookingAuditState>),
    ...(Object.keys(modifiedState) as Array<keyof BookingAuditState>),
  ]);

  return [...keys].sort((a, b) =>
    BOOKING_AUDIT_FIELD_LABELS[a].localeCompare(BOOKING_AUDIT_FIELD_LABELS[b], 'en-IN'),
  );
}
