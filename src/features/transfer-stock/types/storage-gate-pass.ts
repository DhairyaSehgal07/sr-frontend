export type StorageGatePassBagSlot = {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  bagType: string;
  chamber: string;
  floor: string;
  row: string;
};

export type StorageGatePass = {
  _id: string;
  farmerStorageLinkId: string;
  gatePassNo: number;
  manualGatePassNumber: number;
  date: string;
  variety: string;
  storageCategory: string;
  stage?: string;
  bagSizes: StorageGatePassBagSlot[];
  remarks: string;
};

/** `${passId}\u001f${size}\u001f${bagIndex}` — unit separator avoids `|` in size names */
export type TransferAllocationKey = string;

export type TransferStockItem = {
  storageGatePassId: string;
  gatePassNo: number;
  variety: string;
  bagSize: string;
  bagIndex: number;
  quantity: number;
  bagType: string;
  location: {
    chamber: string;
    floor: string;
    row: string;
  };
};

export type VarietyItemGroup = {
  variety: string;
  items: TransferStockItem[];
};

export type LocationFilters = {
  chamber: string;
  floor: string;
  row: string;
};

export type VoucherSort = 'asc' | 'desc';

export type DatePassGroup = {
  dateKey: string;
  dateLabel: string;
  passes: StorageGatePass[];
};
