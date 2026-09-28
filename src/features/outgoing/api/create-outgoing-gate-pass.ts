import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { isDirectSaleOutgoing } from '@/lib/constants';

import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { lookupOutgoingWeight } from '@/features/outgoing/utils/group-outgoing-items';

import type {
  CreateOutgoingAllocation,
  CreateOutgoingGatePassBody,
  CreateOutgoingGatePassInput,
  CreateOutgoingGatePassResponse,
  CreateOutgoingStorageGatePass,
} from './types';

function assignTrimmed(
  body: CreateOutgoingGatePassBody,
  key: keyof Pick<
    CreateOutgoingGatePassBody,
    | 'from'
    | 'to'
    | 'truckNumber'
    | 'transportCompany'
    | 'LSNumber'
    | 'driverName'
    | 'driverMobile'
    | 'owner'
    | 'billBook'
    | 'biltiBook'
  >,
  value: string,
) {
  const trimmed = value.trim();
  if (trimmed) body[key] = trimmed;
}

function assignPositiveInt(
  body: CreateOutgoingGatePassBody,
  key: 'billNumber' | 'biltiNumber',
  value: string,
) {
  const trimmed = value.trim();
  if (!trimmed) return;
  const parsed = Number(trimmed);
  if (Number.isInteger(parsed) && parsed > 0) body[key] = parsed;
}

function deriveVarietyFromItems(items: TransferStockItem[]): string {
  const varieties = new Set(
    items.map((item) => item.variety?.trim()).filter((value) => Boolean(value)),
  );

  if (varieties.size === 0) {
    throw new Error('Could not determine variety from selected allocations.');
  }

  if (varieties.size > 1) {
    throw new Error(
      'All selected allocations must be the same variety. Adjust gate pass selections and try again.',
    );
  }

  return [...varieties][0]!;
}

export function buildStorageGatePassesPayload(
  items: TransferStockItem[],
  weightsBySize: Record<string, number | undefined>,
): CreateOutgoingStorageGatePass[] {
  const byPassId = new Map<string, CreateOutgoingAllocation[]>();

  for (const item of items) {
    const weightInKg = lookupOutgoingWeight(weightsBySize, item.variety, item.bagSize);
    if (weightInKg == null) {
      throw new Error(`Enter average weight in kg for ${item.variety} ${item.bagSize}.`);
    }

    const allocations = byPassId.get(item.storageGatePassId) ?? [];
    allocations.push({
      size: item.bagSize,
      quantityToAllocate: item.quantity,
      weightInKg,
      chamber: item.location.chamber,
      floor: item.location.floor,
      row: item.location.row,
    });
    byPassId.set(item.storageGatePassId, allocations);
  }

  return [...byPassId.entries()].map(([storageGatePassId, allocations]) => ({
    storageGatePassId,
    allocations,
  }));
}

export function toCreateOutgoingGatePassBody({
  form,
  gatePassNo,
  items,
}: CreateOutgoingGatePassInput): CreateOutgoingGatePassBody {
  if (items.length === 0) {
    throw new Error('Select at least one allocation in the gate passes table.');
  }

  const { step1, step2 } = form;

  const body: CreateOutgoingGatePassBody = {
    farmerStorageLinkId: step1.farmerStorageLinkId,
    gatePassNo,
    date: step1.date,
    variety: deriveVarietyFromItems(items),
    category: step1.category.trim(),
    storageGatePasses: buildStorageGatePassesPayload(items, step2.weightsBySize),
    idempotencyKey: crypto.randomUUID(),
  };

  if (isDirectSaleOutgoing(step1.category)) {
    assignTrimmed(body, 'from', step1.from);
    assignTrimmed(body, 'to', step1.to);
    assignTrimmed(body, 'truckNumber', step1.truckNumber);
    assignTrimmed(body, 'transportCompany', step1.transportCompany);
    assignTrimmed(body, 'LSNumber', step1.LSNumber);
    assignTrimmed(body, 'driverName', step1.driverName);
    assignTrimmed(body, 'driverMobile', step1.driverMobile);
    assignTrimmed(body, 'owner', step1.owner);
    assignPositiveInt(body, 'billNumber', step1.billNumber);
    assignPositiveInt(body, 'biltiNumber', step1.biltiNumber);
    assignTrimmed(body, 'billBook', step1.billBook);
    assignTrimmed(body, 'biltiBook', step1.biltiBook);
  }

  if (step1.manualGatePassNumber != null) {
    body.manualGatePassNumber = step1.manualGatePassNumber;
  }

  const remarks = step2.remarks.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  return body;
}

export async function createOutgoingGatePass(
  input: CreateOutgoingGatePassInput,
): Promise<CreateOutgoingGatePassResponse> {
  try {
    const { data } = await apiClient.post<CreateOutgoingGatePassResponse>(
      '/outgoing-gate-pass/',
      toCreateOutgoingGatePassBody(input),
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to create outgoing gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create outgoing gate pass'), {
      cause: error,
    });
  }
}
