import type { WheelEvent } from 'react';

import { BAG_SIZES, POTATO_VARIETY_OPTIONS } from '@/lib/constants';

import type {
  CreateNikasiGatePassBagSizeItem,
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
  costPerBag: string;
};

export type DispatchPreStorageBagSizeSummary = {
  size: string;
  variety: string;
  quantityIssued: number;
  costPerBag: number | undefined;
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
  billBookId: string;
  biltiBook: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: DispatchPreStorageBagSizeSummary[];
  netWeight: number;
  averageWeightPerBag: number;
  remarks: string;
};

const MONGO_OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

export const decimalInputProps = {
  type: 'number' as const,
  min: 0,
  step: '0.01',
  onWheel: (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

export function createDefaultBagSizeRows(): DispatchPreStorageBagSizeRow[] {
  return BAG_SIZES.map((size) => ({
    size,
    isExtra: false,
    variety: '',
    quantityIssued: '',
    costPerBag: '',
  }));
}

export function createEmptyBagSizeRow(): DispatchPreStorageBagSizeRow {
  return { size: '', isExtra: true, variety: '', quantityIssued: '', costPerBag: '' };
}

function formatCostPerBagField(value: number | undefined): string {
  return value != null && Number.isFinite(value) ? String(value) : '';
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
      costPerBag: formatCostPerBagField(match?.costPerBag),
    };
  });

  for (const row of bagSize) {
    if (!defaultSizes.has(row.size) && row.quantityIssued > 0) {
      rows.push({
        size: row.size as BagSizeValue,
        isExtra: true,
        variety: row.variety,
        quantityIssued: String(row.quantityIssued),
        costPerBag: formatCostPerBagField(row.costPerBag),
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

export function parseCostPerBagInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return Number.NaN;
  return parsed;
}

export function isValidCostPerBag(value: number | undefined): value is number {
  return value != null && Number.isFinite(value) && value >= 0;
}

export function billedAmountPaise(costPerBag: number, quantityIssued: number): number {
  return Math.round(costPerBag * quantityIssued * 100);
}

export function hasPositiveBilledAmount(
  rows: readonly Pick<DispatchPreStorageBagSizeSummary, 'costPerBag' | 'quantityIssued'>[],
): boolean {
  return rows.some(
    (row) =>
      isValidCostPerBag(row.costPerBag) &&
      billedAmountPaise(row.costPerBag, row.quantityIssued) > 0,
  );
}

export function lineBilledAmount(costPerBag: number | undefined, quantityIssued: number): number {
  if (!isValidCostPerBag(costPerBag)) return 0;
  return costPerBag * quantityIssued;
}

export function totalBilledAmount(rows: readonly DispatchPreStorageBagSizeSummary[]): number {
  return rows.reduce((sum, row) => sum + lineBilledAmount(row.costPerBag, row.quantityIssued), 0);
}

export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

export function isMongoObjectId(value: string): boolean {
  return MONGO_OBJECT_ID_PATTERN.test(value.trim());
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

function issuedBagRows(
  values: DispatchPreStorageSummaryValues,
): DispatchPreStorageBagSizeSummary[] {
  return values.bagSize.filter((row) => row.quantityIssued > 0 && row.size.trim() !== '');
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
  billBookId?: string;
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
    billBookId: (input.billBookId ?? '').trim(),
    biltiBook: input.biltiBook,
    from: input.from,
    to: input.to,
    truckNumber: input.truckNumber,
    bagSize: input.bagSize.map((row) => ({
      size: row.size.trim(),
      variety: normalizeVariety(row.variety),
      quantityIssued: parseOptionalNumber(row.quantityIssued),
      costPerBag: parseCostPerBagInput(row.costPerBag),
    })),
    netWeight: netWeightKg,
    averageWeightPerBag: calculateAverageWeightPerBagKg(netWeightKg, totalBags),
    remarks: input.remarks,
  };
}

function assertIssuedLinesHaveVariety(rows: DispatchPreStorageBagSizeSummary[]): void {
  if (rows.some((row) => normalizeVariety(row.variety) === '')) {
    throw new Error('Select variety for each issued bag line.');
  }
}

function buildUpdateBagSizePayload(
  values: DispatchPreStorageSummaryValues,
): NikasiGatePassBagSizeItem[] {
  const activeBags = issuedBagRows(values);

  if (activeBags.length === 0) {
    throw new Error('Enter at least one bag line with quantity.');
  }

  assertIssuedLinesHaveVariety(activeBags);

  return activeBags.map((row) => ({
    size: row.size,
    variety: normalizeVariety(row.variety),
    quantityIssued: row.quantityIssued,
  }));
}

function buildCreateBagSizePayload(
  values: DispatchPreStorageSummaryValues,
): CreateNikasiGatePassBagSizeItem[] {
  const activeBags = issuedBagRows(values);

  if (activeBags.length === 0) {
    throw new Error('Enter at least one bag line with quantity.');
  }

  assertIssuedLinesHaveVariety(activeBags);

  if (activeBags.some((row) => !isValidCostPerBag(row.costPerBag))) {
    throw new Error('Enter cost per bag for each issued bag line.');
  }

  if (!hasPositiveBilledAmount(activeBags)) {
    throw new Error('Enter a billed amount greater than zero on at least one bag line.');
  }

  return activeBags.map((row) => ({
    size: row.size,
    variety: normalizeVariety(row.variety),
    quantityIssued: row.quantityIssued,
    costPerBag: row.costPerBag as number,
  }));
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
>(body: T, values: DispatchPreStorageSummaryValues, options?: { includeBillBook?: boolean }): T {
  const billNumber = parseOptionalPositiveInt(values.billNumber);
  if (billNumber != null) body.billNumber = billNumber;

  const bitliNumber = parseOptionalPositiveInt(values.biltiNo);
  if (bitliNumber != null) body.bitliNumber = bitliNumber;

  if (options?.includeBillBook !== false) {
    const billBook = values.billBook.trim();
    if (billBook && Number.isInteger(Number(billBook)) && Number(billBook) > 0) {
      body.billBook = billBook;
    }
  }

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
  if (!isMongoObjectId(values.billBookId)) {
    throw new Error('Select a bill book.');
  }

  const body: CreateNikasiGatePassBody = {
    dispatchLedgerId: values.dispatchLedgerId,
    gatePassNo,
    category: values.category,
    isBooked,
    date: values.date,
    from: values.from,
    to: values.to,
    truckNumber: values.truckNumber,
    billBookId: values.billBookId.trim(),
    bagSize: buildCreateBagSizePayload(values),
    netWeight: values.netWeight,
    averageWeightPerBag: values.averageWeightPerBag,
  };

  applyOptionalFieldsToBody(body, values, { includeBillBook: false });
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
    bagSize: buildUpdateBagSizePayload(values),
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

function issuedLinesHaveValidCost(values: DispatchPreStorageSummaryValues): boolean {
  const issued = issuedBagRows(values);
  if (issued.length === 0) return false;
  return (
    issued.every((row) => isValidCostPerBag(row.costPerBag)) && hasPositiveBilledAmount(issued)
  );
}

export function canSubmitSummaryValues(
  values: DispatchPreStorageSummaryValues | null,
  options?: {
    requireGatePassNo?: boolean;
    gatePassNumberReady?: boolean;
    requireBillBookId?: boolean;
  },
): boolean {
  if (!values) return false;
  if (options?.requireGatePassNo !== false && !values.gatePassNo) return false;
  if (options?.gatePassNumberReady === false) return false;

  const hasActiveBags = values.bagSize.some((row) => row.quantityIssued > 0);

  if (!values.dispatchLedgerId || !values.category || !hasActiveBags) return false;

  if (options?.requireBillBookId) {
    return isMongoObjectId(values.billBookId) && issuedLinesHaveValidCost(values);
  }

  return true;
}
