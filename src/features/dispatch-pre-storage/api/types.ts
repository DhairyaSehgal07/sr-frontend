export type NikasiGatePassBagSizeItem = {
  size: string;
  variety: string;
  quantityIssued: number;
};

export type CreateNikasiGatePassBody = {
  dispatchLedgerId: string;
  gatePassNo: number;
  category: string;
  isBooked: boolean;
  date: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: NikasiGatePassBagSizeItem[];
  netWeight: number;
  averageWeightPerBag: number;
  /** Maps to `billNumber` on backend */
  billNumber?: number;
  /** Maps to `bitliNumber` on backend */
  bitliNumber?: number;
  billBook?: string;
  biltiBook?: string;
  manualGatePassNumber?: number;
  remarks?: string;
  idempotencyKey?: string;
};

export type NikasiGatePassFarmer = {
  _id?: string;
  name: string;
  mobileNumber?: string;
  address?: string;
};

export type NikasiGatePassLinkedBy = {
  _id?: string;
  name: string;
};

export type NikasiGatePassFarmerStorageLink = {
  _id?: string;
  accountNumber: number | string;
  farmerId: NikasiGatePassFarmer;
  linkedById?: NikasiGatePassLinkedBy;
};

export type NikasiGatePassDispatchLedger = {
  _id?: string;
  name: string;
  address?: string;
  mobileNumber?: string;
};

export type NikasiGatePassCreatedBy = {
  _id?: string;
  name: string;
};

export type NikasiGatePass = {
  _id: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  category: string;
  isBooked: boolean;
  from: string;
  to: string;
  truckNumber: string;
  billNumber?: number;
  bitliNumber?: number;
  billBook?: number;
  biltiBook?: number;
  bagSize: NikasiGatePassBagSizeItem[];
  netWeight: number;
  averageWeightPerBag: number;
  remarks?: string;
  /** Present on older records; no longer set on create/update. */
  farmerStorageLinkId?: NikasiGatePassFarmerStorageLink;
  dispatchLedgerId: NikasiGatePassDispatchLedger;
  createdBy?: NikasiGatePassCreatedBy;
  idempotencyKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NikasiGatePassPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type NikasiGatePassListResult = {
  nikasiGatePasses: NikasiGatePass[];
  pagination: NikasiGatePassPagination;
};

export type NikasiGatePassSortOrder = 'asc' | 'desc';

export type NikasiGatePassListParams = {
  page?: number;
  limit?: number;
  sortOrder?: NikasiGatePassSortOrder;
  gatePassNo?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type GetNikasiGatePassesResponse = {
  success: boolean;
  data: NikasiGatePassListResult;
  message?: string;
};

export type CreateNikasiGatePassResponse = {
  success: boolean;
  data: NikasiGatePass | null;
  message?: string;
};

export type UpdateNikasiGatePassBody = {
  dispatchLedgerId: string;
  category: string;
  isBooked: boolean;
  date: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: NikasiGatePassBagSizeItem[];
  netWeight: number;
  averageWeightPerBag: number;
  billNumber?: number;
  bitliNumber?: number;
  billBook?: string;
  biltiBook?: string;
  manualGatePassNumber?: number | null;
  remarks?: string;
};

export type UpdateNikasiGatePassResponse = {
  success: boolean;
  data: NikasiGatePass | null;
  message?: string;
};

export type GetNikasiGatePassByIdResponse = {
  success: boolean;
  data: NikasiGatePass | null;
  message?: string;
};

export type DispatchPreStorageFormValues = {
  manualGatePassNumber: string;
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
  bagSize: Array<{
    size: string;
    isExtra: boolean;
    variety: string;
    quantityIssued: string;
  }>;
  netWeight: string;
  remarks: string;
};

export const nikasiGatePassKeys = {
  all: ['nikasi-gate-pass'] as const,
  lists: () => [...nikasiGatePassKeys.all, 'list'] as const,
  list: (params: NikasiGatePassListParams) => [...nikasiGatePassKeys.lists(), params] as const,
  create: () => [...nikasiGatePassKeys.all, 'create'] as const,
  details: () => [...nikasiGatePassKeys.all, 'detail'] as const,
  detail: (id: string) => [...nikasiGatePassKeys.details(), id] as const,
  update: (id: string) => [...nikasiGatePassKeys.all, 'update', id] as const,
};
