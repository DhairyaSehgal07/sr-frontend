import type { GatePassStatus } from '@/features/incoming/api/types';

export type FarmerVoucherSortOrder = 'asc' | 'desc';

export type FarmerVoucherGatePassType = 'incoming' | 'grading' | 'storage' | 'nikasi' | 'outgoing';

export type FarmerStorageLinkVouchersParams = {
  sortOrder?: FarmerVoucherSortOrder;
  gatePassType?: FarmerVoucherGatePassType;
};

export type FarmerDaybookCreatedBy = {
  _id: string;
  name: string;
  mobileNumber: string;
};

export type FarmerDaybookWeightSlip = {
  slipNumber: string;
  grossWeightKg: number;
  tareWeightKg: number;
};

export type FarmerDaybookIncoming = {
  _id: string;
  farmerStorageLinkId: string;
  createdBy: FarmerDaybookCreatedBy;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety: string;
  category: string;
  truckNumber: string;
  bagsReceived: number;
  weightSlip?: FarmerDaybookWeightSlip;
  status: GatePassStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
};

export type FarmerDaybookFarmer = {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  accountNumber: number;
};

export type FarmerDaybookGradingPassRef = {
  _id: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  createdBy: FarmerDaybookCreatedBy;
};

export type FarmerDaybookSummaries = {
  totalBagsIncoming: number;
  totalBagsGraded: number;
  totalBagsStored: number;
  totalBagsNikasi: number;
  totalBagsOutgoing: number;
};

export type FarmerDaybookEntry = {
  incoming: FarmerDaybookIncoming;
  farmer: FarmerDaybookFarmer;
  gradingPasses: FarmerDaybookGradingPassRef[];
  storagePasses: unknown[];
  nikasiPasses: unknown[];
  outgoingPasses: unknown[];
  summaries: FarmerDaybookSummaries;
};

export type FarmerStorageLinkVouchersResult = {
  daybook: FarmerDaybookEntry[];
};

export type GetFarmerStorageLinkVouchersResponse = {
  success: boolean;
  data: FarmerStorageLinkVouchersResult;
  message?: string;
};
