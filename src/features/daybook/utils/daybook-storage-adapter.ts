import type { DaybookStorageEntry } from '@/features/daybook/api/types';
import type { StorageGatePass } from '@/features/storage/api/types';

export function daybookStorageEntryToGatePass(entry: DaybookStorageEntry): StorageGatePass {
  return {
    _id: entry._id,
    gatePassNo: entry.gatePassNo,
    manualGatePassNumber: entry.manualGatePassNumber,
    date: entry.date,
    variety: entry.variety,
    storageCategory: entry.storageCategory,
    stage: entry.stage,
    bagSizes: entry.bagSizes,
    remarks: entry.remarks,
    farmerStorageLinkId: entry.farmerStorageLinkId,
    createdBy: entry.createdBy,
    createdAt: entry.createdAt,
  };
}
