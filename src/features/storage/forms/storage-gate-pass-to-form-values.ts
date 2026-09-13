import type { StorageGatePass, StorageGatePassBagSize } from '@/features/storage/api/types';
import {
  createDefaultStorageQuantities,
  createEmptyStorageQuantityRow,
  type StorageFormValues,
  type StorageQuantityRow,
} from '@/features/storage/schemas/storage-form-schema';
import { BAG_SIZES, BAG_TYPES, DEFAULT_BAG_TYPE } from '@/lib/constants';

function toIsoDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

function toBagType(value: string): StorageQuantityRow['bagType'] {
  return BAG_TYPES.some((bagType) => bagType === value)
    ? (value as StorageQuantityRow['bagType'])
    : DEFAULT_BAG_TYPE;
}

function toBagSize(value: string): StorageQuantityRow['size'] {
  return BAG_SIZES.some((size) => size === value) ? (value as StorageQuantityRow['size']) : '';
}

function getBagQuantity(bagSize: StorageGatePassBagSize): number | undefined {
  return bagSize.initialQuantity ?? bagSize.currentQuantity;
}

function toQuantityRow(bagSize: StorageGatePassBagSize, isExtra: boolean): StorageQuantityRow {
  return {
    size: toBagSize(bagSize.size),
    isExtra,
    qty: getBagQuantity(bagSize),
    bagType: toBagType(bagSize.bagType),
    chamber: bagSize.chamber,
    floor: bagSize.floor,
    row: bagSize.row,
  };
}

export function storageBagSizesToFormQuantities(
  bagSizes: readonly StorageGatePassBagSize[],
): StorageFormValues['quantities'] {
  const rows = createDefaultStorageQuantities();
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
      ...createEmptyStorageQuantityRow(),
      ...toQuantityRow(bagSize, true),
    });
  }

  return rows;
}

export function storageGatePassToFormValues(
  gatePass: StorageGatePass,
  userId: string,
): StorageFormValues {
  const farmerStorageLinkId =
    typeof gatePass.farmerStorageLinkId === 'string'
      ? gatePass.farmerStorageLinkId
      : (gatePass.farmerStorageLinkId._id ?? '');

  return {
    manualGatePassNumber: gatePass.manualGatePassNumber,
    farmerStorageLinkId,
    createdBy: gatePass.createdBy?._id ?? userId,
    variety: gatePass.variety,
    category: gatePass.storageCategory,
    stage: gatePass.stage ?? '',
    date: toIsoDateTime(gatePass.date),
    quantities: storageBagSizesToFormQuantities(gatePass.bagSizes),
    remarks: gatePass.remarks ?? '',
  };
}
