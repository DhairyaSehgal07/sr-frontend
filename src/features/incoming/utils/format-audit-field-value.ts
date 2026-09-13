import type {
  IncomingGatePassAuditState,
  IncomingGatePassAuditWeightSlip,
  IncomingGatePassFarmerStorageLink,
} from '@/features/incoming/api/types';

export const INCOMING_GATE_PASS_AUDIT_FIELD_LABELS: Record<
  keyof IncomingGatePassAuditState,
  string
> = {
  manualGatePassNumber: 'Manual #',
  truckNumber: 'Truck no.',
  date: 'Date',
  farmerStorageLinkId: 'Farmer',
  variety: 'Variety',
  category: 'Category',
  stage: 'Stage',
  bagsReceived: 'Bags',
  weightSlip: 'Weight slip',
  remarks: 'Remarks',
};

function formatAuditDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatFarmerStorageLink(value: IncomingGatePassFarmerStorageLink | string) {
  if (typeof value === 'string') return value;

  const name = value.farmerId?.name ?? 'Unknown farmer';
  const accountNumber = value.accountNumber;

  return accountNumber != null ? `${name} (Account #${accountNumber})` : name;
}

function formatWeightSlip(value: IncomingGatePassAuditWeightSlip) {
  const parts: string[] = [];

  if (value.slipNumber != null && value.slipNumber !== '') {
    parts.push(value.slipNumber);
  }

  if (typeof value.grossWeightKg === 'number' && !Number.isNaN(value.grossWeightKg)) {
    parts.push(`gross ${formatNumber(value.grossWeightKg)} kg`);
  }

  if (typeof value.tareWeightKg === 'number' && !Number.isNaN(value.tareWeightKg)) {
    parts.push(`tare ${formatNumber(value.tareWeightKg)} kg`);
  }

  const hasGross = typeof value.grossWeightKg === 'number' && !Number.isNaN(value.grossWeightKg);
  const hasTare = typeof value.tareWeightKg === 'number' && !Number.isNaN(value.tareWeightKg);

  if (hasGross && hasTare) {
    const netKg = value.grossWeightKg! - value.tareWeightKg!;
    if (!Number.isNaN(netKg)) {
      parts.push(`net ${formatNumber(netKg)} kg`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : '—';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatAuditFieldValue(
  field: keyof IncomingGatePassAuditState,
  value: unknown,
): string {
  if (value == null || value === '') return '—';

  switch (field) {
    case 'manualGatePassNumber':
      return typeof value === 'number' ? formatNumber(value) : String(value);
    case 'bagsReceived':
      return typeof value === 'number' ? formatNumber(value) : String(value);
    case 'date':
      return typeof value === 'string' ? formatAuditDate(value) : String(value);
    case 'farmerStorageLinkId':
      return typeof value === 'object' && value != null
        ? formatFarmerStorageLink(value as IncomingGatePassFarmerStorageLink | string)
        : String(value);
    case 'weightSlip':
      return typeof value === 'object' && value != null
        ? formatWeightSlip(value as IncomingGatePassAuditWeightSlip)
        : String(value);
    default:
      return String(value);
  }
}

export function getIncomingGatePassAuditChangedFields(
  previousState: IncomingGatePassAuditState,
  modifiedState: IncomingGatePassAuditState,
): Array<keyof IncomingGatePassAuditState> {
  const keys = new Set([
    ...(Object.keys(previousState) as Array<keyof IncomingGatePassAuditState>),
    ...(Object.keys(modifiedState) as Array<keyof IncomingGatePassAuditState>),
  ]);

  return [...keys].sort((a, b) =>
    INCOMING_GATE_PASS_AUDIT_FIELD_LABELS[a].localeCompare(
      INCOMING_GATE_PASS_AUDIT_FIELD_LABELS[b],
      'en-IN',
    ),
  );
}
