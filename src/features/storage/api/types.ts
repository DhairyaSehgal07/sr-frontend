import type { StorageFormValues } from '@/features/storage/types';
import type { BagType } from '@/lib/constants';

export type StorageGatePassBagSize = {
  size: string;
  bagType: BagType | string;
  currentQuantity: number;
  initialQuantity: number;
  chamber: string;
  floor: string;
  row: string;
};

export type StorageGatePassFarmer = {
  _id?: string;
  name: string;
  mobileNumber?: string;
  address?: string;
};

export type StorageGatePassLinkedBy = {
  _id?: string;
  name: string;
};

export type StorageGatePassFarmerStorageLink = {
  _id?: string;
  accountNumber: number | string;
  farmerId: StorageGatePassFarmer;
  linkedById?: StorageGatePassLinkedBy;
};

export type StorageGatePassCreatedBy = {
  _id?: string;
  name: string;
  mobileNumber?: string;
};

export type StorageGatePass = {
  _id: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  storageCategory: string;
  generation?: string;
  stage?: string;
  bagSizes: StorageGatePassBagSize[];
  totalBags?: number;
  remarks?: string;
  farmerStorageLinkId: StorageGatePassFarmerStorageLink;
  createdBy?: StorageGatePassCreatedBy;
  createdAt?: string;
  updatedAt?: string;
};

export type StorageGatePassPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StorageGatePassListResult = {
  storageGatePasses: StorageGatePass[];
  pagination: StorageGatePassPagination;
};

export type StorageGatePassSortOrder = 'asc' | 'desc';

export type StorageGatePassStatusFilter = 'graded' | 'ungraded';

export type StorageGatePassListParams = {
  page?: number;
  limit?: number;
  sortOrder?: StorageGatePassSortOrder;
  gatePassNo?: number;
  status?: StorageGatePassStatusFilter;
  dateFrom?: string;
  dateTo?: string;
};

export type StorageGatePassByFarmer = {
  _id: string;
  farmerStorageLinkId: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  storageCategory: string;
  stage?: string;
  bagSizes: StorageGatePassBagSize[];
  editHistory?: unknown[];
  createdAt?: string;
  updatedAt?: string;
};

export type StorageGatePassesByFarmerResult = {
  storageGatePasses: StorageGatePassByFarmer[];
};

export type StorageGatePassesByFarmerParams = {
  sortOrder?: StorageGatePassSortOrder;
};

export type GetStorageGatePassesByFarmerResponse = {
  success: boolean;
  data: StorageGatePassesByFarmerResult;
  message?: string;
};

export type GetStorageGatePassesResponse = {
  success: boolean;
  data: StorageGatePassListResult;
  message?: string;
};

export type SearchStorageGatePassResult = {
  storageGatePasses: StorageGatePass[];
};

export type SearchStorageGatePassesResponse = {
  success: boolean;
  data: SearchStorageGatePassResult;
  message?: string;
};

export type SearchStorageGatePassBody = {
  number: number;
};

export type CreateStorageGatePassBody = {
  farmerStorageLinkId: string;
  gatePassNo: number;
  date: string;
  variety: string;
  storageCategory: string;
  stage?: string;
  bagSizes: StorageGatePassBagSize[];
  manualGatePassNumber?: number;
  remarks?: string;
  idempotencyKey?: string;
};

export type CreateStorageGatePassResponse = {
  success?: boolean;
  status?: string;
  data?: Record<string, unknown>;
  message?: string;
};

export type CreateStorageGatePassInput = {
  form: StorageFormValues;
  gatePassNo: number;
};

export type UpdateStorageGatePassBody = {
  manualGatePassNumber?: number | null;
  date: string;
  farmerStorageLinkId: string;
  variety: string;
  storageCategory: string;
  stage?: string;
  bagSizes: StorageGatePassBagSize[];
  remarks?: string;
};

export type UpdateStorageGatePassResponse = {
  success?: boolean;
  status?: string;
  data?: Record<string, unknown> | null;
  message?: string;
};

export type UpdateStorageGatePassInput = {
  id: string;
  form: StorageFormValues;
};

export type StorageGatePassAuditEditor = {
  _id: string;
  name: string;
  mobileNumber?: string;
};

export type StorageGatePassAuditState = Partial<{
  manualGatePassNumber: number | null;
  date: string;
  farmerStorageLinkId: StorageGatePassFarmerStorageLink | string;
  variety: string;
  storageCategory: string;
  stage: string;
  bagSizes: StorageGatePassBagSize[];
  remarks: string;
}>;

export type StorageGatePassAudit = {
  _id: string;
  storageGatePassId: string;
  editedById: StorageGatePassAuditEditor;
  previousState: StorageGatePassAuditState;
  modifiedState: StorageGatePassAuditState;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type StorageGatePassEditsListParams = {
  page?: number;
  limit?: number;
};

export type StorageGatePassEditsListResult = {
  audits: StorageGatePassAudit[];
  pagination: StorageGatePassPagination;
};

export type GetStorageGatePassEditsResponse = {
  success: boolean;
  data: StorageGatePassEditsListResult;
  message?: string;
};
