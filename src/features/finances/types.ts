export type SaleStatus = 'open' | 'partial' | 'settled';

export type FinancesTotals = {
  sales: number;
  recovered: number;
  outstanding: number;
};

export type SaleRow = {
  id: string;
  dispatchId: string;
  date: string;
  gatePassNo: number;
  billNumber?: number;
  billBook: string;
  partyName: string;
  bags: number;
  amount: number;
  status: SaleStatus;
};

export type PartyOutstanding = {
  dispatchLedgerId: string;
  partyName: string;
  billBookId: string;
  billBook: string;
  billed: number;
  recovered: number;
  due: number;
};

export type RecoveryEntry = {
  id: string;
  date: string;
  dispatchLedgerId: string;
  partyName: string;
  billBookId: string;
  billBook: string;
  amount: number;
  remark?: string;
};
