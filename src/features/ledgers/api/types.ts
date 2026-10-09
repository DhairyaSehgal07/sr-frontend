import type { FinanceRecovery, FinanceSale, FinanceSummary } from '@/features/finances/api/types';

import type { DispatchLedger } from '../types';

export type DispatchLedgerBillBookRow = {
  billBookId: string;
  billBookName: string;
  billedPaise: number;
  recoveredPaise: number;
  outstandingPaise: number;
};

export type DispatchLedgerFinanceDetail = {
  dispatchLedger: DispatchLedger;
  summary: FinanceSummary;
  byBillBook: DispatchLedgerBillBookRow[];
  sales: FinanceSale[];
  recoveries: FinanceRecovery[];
};

export type DispatchLedgerFinanceResponse = {
  success: boolean;
  data?: DispatchLedgerFinanceDetail;
  message?: string;
};

export type PartyGatePassBagSize = {
  size: string;
  variety: string;
  quantityIssued: number;
  costPerBag?: number;
};

export type PartyGatePassBillBookRef = {
  _id: string;
  name: string;
};

/** Gate pass row from `GET /nikasi-gate-pass/:dispatchLedgerId`. */
export type PartyGatePass = {
  _id: string;
  dispatchLedgerId?: {
    _id?: string;
    name: string;
    address?: string;
    mobileNumber?: string;
  };
  createdBy?: {
    _id?: string;
    name: string;
  };
  gatePassNo: number;
  manualGatePassNumber?: number;
  isBooked: boolean;
  billNumber?: number;
  bitliNumber?: number;
  billBookId?: string | PartyGatePassBillBookRef;
  billBook?: string | number;
  biltiBook?: string | number;
  category: string;
  date: string;
  from: string;
  to: string;
  truckNumber: string;
  transportCompany?: string;
  LSNumber?: string;
  driverName?: string;
  driverMobile?: string;
  owner?: string;
  bagSize: PartyGatePassBagSize[];
  remarks?: string;
  netWeight: number;
  averageWeightPerBag?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PartyGatePassesResponse = {
  success: boolean;
  data?: {
    nikasiGatePasses: PartyGatePass[];
  };
  message?: string;
};
