import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { lookupOutgoingWeight } from '@/features/outgoing/utils/group-outgoing-items';

import type {
  CreateOutgoingAllocation,
  CreateOutgoingGatePassBody,
  CreateOutgoingGatePassInput,
  CreateOutgoingGatePassResponse,
  CreateOutgoingStorageGatePass,
} from './types';

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
    from: step1.from.trim(),
    to: step1.to.trim(),
    category: step1.category.trim(),
    billNumber: Number(step1.billNumber),
    biltiNumber: Number(step1.biltiNumber),
    billBook: step1.billBook.trim(),
    biltiBook: step1.biltiBook.trim(),
    storageGatePasses: buildStorageGatePassesPayload(items, step2.weightsBySize),
    idempotencyKey: crypto.randomUUID(),
  };

  const truckNumber = step1.truckNumber.trim();
  if (truckNumber) {
    body.truckNumber = truckNumber;
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
