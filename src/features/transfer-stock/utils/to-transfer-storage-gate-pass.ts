import type { StorageGatePassByFarmer } from '@/features/storage/api/types';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';

export function toTransferStorageGatePass(pass: StorageGatePassByFarmer): StorageGatePass {
  return {
    _id: pass._id,
    farmerStorageLinkId: pass.farmerStorageLinkId,
    gatePassNo: pass.gatePassNo,
    manualGatePassNumber: pass.manualGatePassNumber ?? 0,
    date: pass.date,
    variety: pass.variety,
    storageCategory: pass.storageCategory,
    stage: pass.stage,
    bagSizes: pass.bagSizes.map((bag) => ({
      size: bag.size,
      currentQuantity: bag.currentQuantity,
      initialQuantity: bag.initialQuantity,
      bagType: String(bag.bagType),
      chamber: bag.chamber,
      floor: bag.floor,
      row: bag.row,
    })),
    remarks: '',
  };
}
