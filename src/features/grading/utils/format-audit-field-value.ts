import type {
  GradingGatePassAuditState,
  GradingGatePassIncomingRef,
  GradingOrderDetail,
} from '@/features/grading/api/types';

export const GRADING_GATE_PASS_AUDIT_FIELD_LABELS: Record<keyof GradingGatePassAuditState, string> =
  {
    manualGatePassNumber: 'Manual #',
    date: 'Date',
    variety: 'Variety',
    orderDetails: 'Order details',
    incomingGatePassIds: 'Incoming gate passes',
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

function formatOrderDetail(row: GradingOrderDetail) {
  return `${row.size} · ${row.bagType} · ${formatNumber(row.quantity)} bags · ${formatNumber(row.weightPerBagKg)} kg/bag`;
}

function formatOrderDetails(value: GradingOrderDetail[]) {
  if (value.length === 0) return '—';

  return value.map(formatOrderDetail).join('; ');
}

function formatIncomingGatePassRef(ref: GradingGatePassIncomingRef | string) {
  if (typeof ref === 'string') return ref;

  const manualNumber =
    ref.manualGatePassNumber != null ? ` · manual #${formatNumber(ref.manualGatePassNumber)}` : '';

  return `#${formatNumber(ref.gatePassNo)}${manualNumber} · ${formatNumber(ref.bagsReceived)} bags`;
}

function formatIncomingGatePassIds(value: GradingGatePassIncomingRef[] | string[]) {
  if (value.length === 0) return '—';

  return value.map(formatIncomingGatePassRef).join('; ');
}

export function formatAuditFieldValue(
  field: keyof GradingGatePassAuditState,
  value: unknown,
): string {
  if (value == null || value === '') return '—';

  switch (field) {
    case 'manualGatePassNumber':
      return typeof value === 'number' ? formatNumber(value) : String(value);
    case 'date':
      return typeof value === 'string' ? formatAuditDate(value) : String(value);
    case 'orderDetails':
      return Array.isArray(value)
        ? formatOrderDetails(value as GradingOrderDetail[])
        : String(value);
    case 'incomingGatePassIds':
      return Array.isArray(value)
        ? formatIncomingGatePassIds(value as GradingGatePassIncomingRef[] | string[])
        : String(value);
    default:
      return String(value);
  }
}

export function getGradingGatePassAuditChangedFields(
  previousState: GradingGatePassAuditState,
  modifiedState: GradingGatePassAuditState,
): Array<keyof GradingGatePassAuditState> {
  const keys = new Set([
    ...(Object.keys(previousState) as Array<keyof GradingGatePassAuditState>),
    ...(Object.keys(modifiedState) as Array<keyof GradingGatePassAuditState>),
  ]);

  return [...keys].sort((a, b) =>
    GRADING_GATE_PASS_AUDIT_FIELD_LABELS[a].localeCompare(
      GRADING_GATE_PASS_AUDIT_FIELD_LABELS[b],
      'en-IN',
    ),
  );
}
