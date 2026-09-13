import type {
  StorageGatePassAuditState,
  StorageGatePassBagSize,
  StorageGatePassFarmerStorageLink,
} from '@/features/storage/api/types';

export const STORAGE_GATE_PASS_AUDIT_FIELD_LABELS: Record<keyof StorageGatePassAuditState, string> =
  {
    manualGatePassNumber: 'Manual #',
    date: 'Date',
    farmerStorageLinkId: 'Farmer',
    variety: 'Variety',
    storageCategory: 'Storage category',
    stage: 'Stage',
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

function formatFarmerStorageLink(value: StorageGatePassFarmerStorageLink | string) {
  if (typeof value === 'string') return value;

  const name = value.farmerId?.name ?? 'Unknown farmer';
  const accountNumber = value.accountNumber;

  return accountNumber != null ? `${name} (Account #${accountNumber})` : name;
}

function formatBagSize(row: StorageGatePassBagSize) {
  const location = [row.chamber, row.floor, row.row].filter(Boolean).join('/');

  const locationText = location ? ` - ${location}` : '';

  return `${row.size} - ${row.bagType} - current ${formatQuantity(
    row.currentQuantity,
  )} / initial ${formatQuantity(row.initialQuantity)}${locationText}`;
}

function formatBagSizes(value: StorageGatePassBagSize[]) {
  if (value.length === 0) return '-';

  return value.map(formatBagSize).join('; ');
}

export function formatAuditFieldValue(
  field: keyof StorageGatePassAuditState,
  value: unknown,
): string {
  if (value == null || value === '') return '-';

  switch (field) {
    case 'manualGatePassNumber':
      return typeof value === 'number' ? formatNumber(value) : String(value);
    case 'date':
      return typeof value === 'string' ? formatAuditDate(value) : String(value);
    case 'farmerStorageLinkId':
      return typeof value === 'object' && value != null
        ? formatFarmerStorageLink(value as StorageGatePassFarmerStorageLink | string)
        : String(value);
    case 'bagSizes':
      return Array.isArray(value)
        ? formatBagSizes(value as StorageGatePassBagSize[])
        : String(value);
    default:
      return String(value);
  }
}

export function getStorageGatePassAuditChangedFields(
  previousState: StorageGatePassAuditState,
  modifiedState: StorageGatePassAuditState,
): Array<keyof StorageGatePassAuditState> {
  const keys = new Set([
    ...(Object.keys(previousState) as Array<keyof StorageGatePassAuditState>),
    ...(Object.keys(modifiedState) as Array<keyof StorageGatePassAuditState>),
  ]);

  return [...keys].sort((a, b) =>
    STORAGE_GATE_PASS_AUDIT_FIELD_LABELS[a].localeCompare(
      STORAGE_GATE_PASS_AUDIT_FIELD_LABELS[b],
      'en-IN',
    ),
  );
}
