export type FinanceSaleStatus = 'open' | 'partial' | 'settled';

export type FinanceListParams = {
  billBookId?: string;
};

export type FinanceSale = {
  _id: string;
  coldStorageId: string;
  dispatchId: string;
  date: string;
  gatePassNo: number;
  billBookId: string;
  billBookName: string;
  billNumber?: number;
  dispatchLedgerId: string;
  dispatchLedgerName: string;
  bags: number;
  netWeight?: number;
  amountPaise: number;
  recoveredPaise: number;
  outstandingPaise: number;
  status: FinanceSaleStatus;
  createdAt: string;
  updatedAt: string;
};

export type FinanceRecoveryAllocation = {
  saleId: string;
  amountPaise: number;
};

export type FinanceRecovery = {
  _id: string;
  coldStorageId: string;
  date: string;
  dispatchLedgerId: string;
  dispatchLedgerName: string;
  billBookId: string;
  billBookName: string;
  amountPaise: number;
  remark?: string;
  allocations: FinanceRecoveryAllocation[];
  createdAt: string;
  updatedAt: string;
};

export type FinanceOutstanding = {
  dispatchLedgerId: string;
  billBookId: string;
  dispatchLedgerName: string;
  billBookName: string;
  billedPaise: number;
  recoveredPaise: number;
  outstandingPaise: number;
};

export type FinanceSummary = {
  billedPaise: number;
  recoveredPaise: number;
  outstandingPaise: number;
  saleCount: number;
  recoveryCount: number;
};

export type CreateFinanceRecoveryBody = {
  date: string;
  dispatchLedgerId: string;
  billBookId: string;
  amountPaise: number;
  remark?: string;
};

export type GetFinanceSummaryResponse = {
  success: boolean;
  data: FinanceSummary;
  message?: string;
};

export type GetFinanceSalesResponse = {
  success: boolean;
  data: FinanceSale[];
  message?: string;
};

export type GetFinanceOutstandingResponse = {
  success: boolean;
  data: FinanceOutstanding[];
  message?: string;
};

export type GetFinanceRecoveriesResponse = {
  success: boolean;
  data: FinanceRecovery[];
  message?: string;
};

export type CreateFinanceRecoveryResponse = {
  success: boolean;
  data: FinanceRecovery;
  message?: string;
};
