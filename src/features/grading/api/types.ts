import type { BagType } from '@/lib/constants';
import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';

export type GradingOrderDetail = {
  size: string;
  bagType: BagType;
  quantity: number;
  weightPerBagKg: number;
};

export type CreateGradingGatePassBody = {
  farmerStorageLinkId: string;
  incomingGatePassIds: string[];
  gatePassNo: number;
  date: string;
  variety: string;
  orderDetails: GradingOrderDetail[];
  manualGatePassNumber?: number;
  remarks?: string;
};

export type CreateGradingGatePassResponse = {
  success: boolean;
  data: Record<string, unknown> | null;
  message?: string;
};

export type CreateGradingGatePassInput = {
  form: GradingFormValues;
  gatePassNo: number;
};

export type UpdateGradingGatePassBody = {
  variety: string;
  date: string;
  orderDetails: GradingOrderDetail[];
  manualGatePassNumber?: number;
  remarks?: string;
};

export type UpdateGradingGatePassInput = {
  id: string;
  form: GradingFormValues;
};

export type UpdateGradingGatePassResponse = {
  success: boolean;
  data: Record<string, unknown> | null;
  message?: string;
};

export type GradingGatePassIncomingRefWeightSlip = {
  slipNumber?: string;
  grossWeightKg: number;
  tareWeightKg: number;
};

export type GradingGatePassIncomingRef = {
  _id?: string;
  gatePassNo: number;
  manualGatePassNumber?: number | null;
  bagsReceived: number;
  grossWeightKg?: number;
  tareWeightKg?: number;
  weightSlip?: GradingGatePassIncomingRefWeightSlip;
  date?: string;
  truckNumber?: string;
  status?: string;
};

export type GradingGatePassFarmer = {
  _id?: string;
  name: string;
};

export type GradingGatePassFarmerStorageLink = {
  _id?: string;
  accountNumber?: number;
  farmerId: GradingGatePassFarmer;
};

export type GradingGatePassCreatedBy = {
  _id?: string;
  name: string;
  mobileNumber?: string;
};

export type GradingGatePass = {
  _id: string;
  farmerStorageLinkId: GradingGatePassFarmerStorageLink | string;
  incomingGatePassIds: GradingGatePassIncomingRef[];
  createdBy: GradingGatePassCreatedBy;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  orderDetails: GradingOrderDetail[];
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GradingGatePassPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GradingGatePassListResult = {
  gradingGatePasses: GradingGatePass[];
  pagination: GradingGatePassPagination;
};

export type GradingGatePassSortOrder = 'asc' | 'desc';

export type GradingGatePassListParams = {
  page?: number;
  limit?: number;
  sortOrder?: GradingGatePassSortOrder;
};

export type GetGradingGatePassesResponse = {
  success: boolean;
  data: GradingGatePassListResult;
  message?: string;
};

export type GetGradingGatePassByIdResponse = {
  success: boolean;
  data: GradingGatePass;
  message?: string;
};

export type SearchGradingGatePassBody = {
  number: number;
};

export type GradingIncomingGatePassLinkInput = {
  gradingGatePassId: string;
  incomingGatePassId: string;
};

export type GradingIncomingGatePassLinkResponse = {
  success: boolean;
  data: Record<string, unknown> | null;
  message?: string;
};

export type GradingGatePassAuditEditor = {
  _id: string;
  name: string;
  mobileNumber?: string;
};

export type GradingGatePassAuditState = Partial<{
  manualGatePassNumber: number | null;
  date: string;
  variety: string;
  orderDetails: GradingOrderDetail[];
  incomingGatePassIds: GradingGatePassIncomingRef[] | string[];
  remarks: string;
}>;

export type GradingGatePassAudit = {
  _id: string;
  gradingGatePassId: string;
  editedById: GradingGatePassAuditEditor;
  previousState: GradingGatePassAuditState;
  modifiedState: GradingGatePassAuditState;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type GradingGatePassEditsListParams = {
  page?: number;
  limit?: number;
};

export type GradingGatePassEditsListResult = {
  audits: GradingGatePassAudit[];
  pagination: GradingGatePassPagination;
};

export type GetGradingGatePassEditsResponse = {
  success: boolean;
  data: GradingGatePassEditsListResult;
  message?: string;
};
