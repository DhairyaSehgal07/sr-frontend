import type { WheelEvent } from 'react';

import { BAG_SIZES, POTATO_VARIETY_OPTIONS } from '@/lib/constants';

import type {
  CreateNikasiGatePassBody,
  NikasiGatePassBagSizeItem,
  UpdateNikasiGatePassBody,
} from '@/features/dispatch-pre-storage/api/types';

export type BagSizeValue = (typeof BAG_SIZES)[number] | '';

export type DispatchPreStorageBagSizeRow = {
  size: BagSizeValue;
  isExtra: boolean;
  variety: string;
  quantityIssued: string;
};

export type DispatchPreStorageBagSizeSummary = {
  size: string;
  variety: string;
  quantityIssued: number;
};

export type DispatchPreStorageSummaryValues = {
  gatePassNo: string;
  manualGatePassNumber?: string;
  date: string;
  dispatchLedgerId: string;
  category: string;
  billNumber: string;
  biltiNo: string;
  billBook: string;
  biltiBook: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: DispatchPreStorageBagSizeSummary[];
  netWeight: number;
  averageWeightPerBag: number;
  remarks: string;
};

export const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

export function createDefaultBagSizeRows(): DispatchPreStorageBagSizeRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    variety: '',
    quantityIssued: '',
  }));
}

export function createEmptyBagSizeRow(): DispatchPreStorageBagSizeRow {
  return { size: '', isExtra: true, variety: '', quantityIssued: '' };
}

export function gatePassBagSizeToRows(
  bagSize: readonly NikasiGatePassBagSizeItem[],
): DispatchPreStorageBagSizeRow[] {
  const defaultSizes = new Set<string>(BAG_SIZES);
  const rows: DispatchPreStorageBagSizeRow[] = BAG_SIZES.map((size) => {
    const match = bagSize.find((row) => row.size === size);
    return {
      size,
      isExtra: false,
      variety: match?.variety ?? '',
      quantityIssued: match != null && match.quantityIssued > 0 ? String(match.quantityIssued) : '',
    };
  });

  for (const row of bagSize) {
    if (!defaultSizes.has(row.size) && row.quantityIssued > 0) {
      rows.push({
        size: row.size as BagSizeValue,
        isExtra: true,
        variety: row.variety,
        quantityIssued: String(row.quantityIssued),
      });
    }
  }

  return rows;
}

export function formatOptionalNumber(value: string) {
  if (value === '') return '0';
  const parsed = Number(value);
  return Number.isNaN(parsed) ? '0' : parsed.toLocaleString('en-IN');
}

export function parseOptionalNumber(value: string): number {
  if (value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function parseOptionalPositiveInt(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseRequiredPositiveInt(value: string, label: string): number {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error(`${label} is required.`);
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a whole number greater than zero.`);
  }
  return parsed;
}

function normalizeVariety(value: string): string {
  const selected = POTATO_VARIETY_OPTIONS.find((item) => item.id === value);
  return (selected?.label ?? value).trim();
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateAverageWeightPerBagKg(netWeightKg: number, totalBags: number): number {
  if (totalBags <= 0 || netWeightKg <= 0) return 0;
  return roundToDecimals(netWeightKg / totalBags, 2);
}

export function formatWeightKg(value: number, maximumFractionDigits = 2): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })} kg`;
}

export function buildSummaryValues(input: {
  gatePassNo: string;
  manualGatePassNumber: string;
  date: Date | undefined;
  dispatchLedgerId: string;
  category: string;
  billNumber: string;
  biltiNo: string;
  billBook: string;
  biltiBook: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: DispatchPreStorageBagSizeRow[];
  netWeight: string;
  remarks: string;
}): DispatchPreStorageSummaryValues | null {
  if (!input.date) return null;

  const netWeightKg = parseOptionalNumber(input.netWeight);
  const totalBags = input.bagSize.reduce(
    (sum, row) => sum + parseOptionalNumber(row.quantityIssued),
    0,
  );

  return {
    gatePassNo: input.gatePassNo.trim(),
    manualGatePassNumber: input.manualGatePassNumber.trim() || undefined,
    date: input.date.toISOString(),
    dispatchLedgerId: input.dispatchLedgerId,
    category: input.category,
    billNumber: input.billNumber,
    biltiNo: input.biltiNo,
    billBook: input.billBook,
    biltiBook: input.biltiBook,
    from: input.from,
    to: input.to,
    truckNumber: input.truckNumber,
    bagSize: input.bagSize.map((row) => ({
      size: row.size.trim(),
      variety: normalizeVariety(row.variety),
      quantityIssued: parseOptionalNumber(row.quantityIssued),
    })),
    netWeight: netWeightKg,
    averageWeightPerBag: calculateAverageWeightPerBagKg(netWeightKg, totalBags),
    remarks: input.remarks,
  };
}

function buildActiveBagSizePayload(
  values: DispatchPreStorageSummaryValues,
): NikasiGatePassBagSizeItem[] {
  const activeBags = values.bagSize.filter(
    (row) => row.quantityIssued > 0 && row.size.trim() !== '',
  );

  if (activeBags.length === 0) {
    throw new Error('Enter at least one bag line with quantity.');
  }

  const bagSizePayload = activeBags.map((row) => ({
    size: row.size,
    variety: normalizeVariety(row.variety),
    quantityIssued: row.quantityIssued,
  }));

  if (bagSizePayload.some((row) => row.variety === '')) {
    throw new Error('Select variety for each issued bag line.');
  }

  return bagSizePayload;
}

function applyOptionalFieldsToBody<
  T extends {
    billNumber?: number;
    bitliNumber?: number;
    manualGatePassNumber?: number | null;
    remarks?: string;
    billBook?: string;
    biltiBook?: string;
  },
>(body: T, values: DispatchPreStorageSummaryValues): T {
  const billNumber = parseOptionalPositiveInt(values.billNumber);
  if (billNumber != null) body.billNumber = billNumber;

  const bitliNumber = parseOptionalPositiveInt(values.biltiNo);
  if (bitliNumber != null) body.bitliNumber = bitliNumber;

  const billBook = values.billBook.trim();
  if (billBook) body.billBook = billBook;

  const biltiBook = values.biltiBook.trim();
  if (biltiBook) body.biltiBook = biltiBook;

  const manualGatePassNumber = parseOptionalPositiveInt(values.manualGatePassNumber ?? '');
  if (manualGatePassNumber != null) {
    body.manualGatePassNumber = manualGatePassNumber;
  }

  const remarks = values.remarks.trim();
  if (remarks) body.remarks = remarks;

  return body;
}

export function buildCreateApiBody(
  values: DispatchPreStorageSummaryValues,
  gatePassNo: number,
  isBooked: boolean,
): CreateNikasiGatePassBody {
  const body: CreateNikasiGatePassBody = {
    dispatchLedgerId: values.dispatchLedgerId,
    gatePassNo,
    category: values.category,
    isBooked,
    date: values.date,
    from: values.from,
    to: values.to,
    truckNumber: values.truckNumber,
    bagSize: buildActiveBagSizePayload(values),
    netWeight: values.netWeight,
    averageWeightPerBag: values.averageWeightPerBag,
  };

  applyOptionalFieldsToBody(body, values);
  body.idempotencyKey = crypto.randomUUID();

  return body;
}

export function buildUpdateApiBody(
  values: DispatchPreStorageSummaryValues,
  isBooked: boolean,
): UpdateNikasiGatePassBody {
  const body: UpdateNikasiGatePassBody = {
    dispatchLedgerId: values.dispatchLedgerId,
    category: values.category,
    isBooked,
    date: values.date,
    from: values.from,
    to: values.to,
    truckNumber: values.truckNumber,
    bagSize: buildActiveBagSizePayload(values),
    netWeight: values.netWeight,
    averageWeightPerBag: values.averageWeightPerBag,
  };

  applyOptionalFieldsToBody(body, values);

  const manualTrimmed = values.manualGatePassNumber?.trim() ?? '';
  if (manualTrimmed === '') {
    body.manualGatePassNumber = null;
  }

  return body;
}

export function canSubmitSummaryValues(
  values: DispatchPreStorageSummaryValues | null,
  options?: { requireGatePassNo?: boolean; gatePassNumberReady?: boolean },
): boolean {
  if (!values) return false;
  if (options?.requireGatePassNo !== false && !values.gatePassNo) return false;
  if (options?.gatePassNumberReady === false) return false;

  const hasActiveBags = values.bagSize.some((row) => row.quantityIssued > 0);

  return Boolean(values.dispatchLedgerId && values.category && hasActiveBags);
}
