import type { BagType } from '@/lib/constants';

export type DaybookListType = 'all' | 'incoming' | 'outgoing';
export type DaybookSortBy = 'latest' | 'oldest';
export type DaybookPassKind = 'storage' | 'outgoing';

export type DaybookQueryParams = {
  type?: DaybookListType;
  sortBy?: DaybookSortBy;
  page?: number;
  limit?: number;
};

export type DaybookPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
};

export type DaybookFarmer = {
  _id: string;
  name: string;
  mobileNumber: string;
  address: string;
};

export type DaybookFarmerStorageLink = {
  _id: string;
  accountNumber: number;
  farmerId: DaybookFarmer;
};

export type DaybookCreatedBy = {
  _id: string;
  name: string;
};

export type DaybookBagSize = {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  bagType: BagType | string;
  chamber: string;
  floor: string;
  row: string;
};

export type DaybookOrderDetail = {
  size: string;
  bagType: BagType | string;
  quantityIssued: number;
  quantityAvailable: number;
  weightInKg?: number;
  chamber: string;
  floor: string;
  row: string;
};

export type DaybookSnapshotBagSize = {
  size: string;
  bagType: BagType | string;
  chamber: string;
  floor: string;
  row: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityIssued: number;
};

export type DaybookStorageGatePassSnapshot = {
  _id: string;
  gatePassNo: number;
  variety: string;
  storageCategory: string;
  bagSizes: DaybookSnapshotBagSize[];
};

interface DaybookEntryBase {
  _id: string;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  remarks?: string;
  createdAt: string;
}

export type DaybookStorageEntry = DaybookEntryBase & {
  passKind: 'storage';
  storageCategory: string;
  stage?: string;
  bagSizes: DaybookBagSize[];
};

export type DaybookOutgoingEntry = DaybookEntryBase & {
  passKind: 'outgoing';
  from: string;
  to: string;
  truckNumber: string;
  category?: string;
  billNumber?: number;
  biltiNumber?: number;
  billBook?: number;
  biltiBook?: number;
  orderDetails: DaybookOrderDetail[];
  storageGatePassSnapshots: DaybookStorageGatePassSnapshot[];
  status: 'ACTIVE';
};

export type DaybookEntry = DaybookStorageEntry | DaybookOutgoingEntry;

export type DaybookResponseFormat = 'modern' | 'legacy';

export type DaybookListResult = {
  entries: DaybookEntry[];
  pagination: DaybookPagination;
  format?: DaybookResponseFormat;
};

export type DaybookResponse = {
  success: true;
  data: DaybookEntry[];
  pagination: DaybookPagination;
};

export type DaybookErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
