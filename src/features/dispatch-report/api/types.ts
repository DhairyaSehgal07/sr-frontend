/** One row per nikasi gate pass from `GET /nikasi-gate-pass/report` */
export type DispatchReportBagSizeItem = {
  size: string;
  variety: string;
  quantityIssued: number;
};

export type DispatchReportRow = {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  manualGatePassNumber: string;
  gatePassNo: string;
  date: string;
  category: string;
  from: string;
  to: string;
  truckNumber: string;
  bagSize: DispatchReportBagSizeItem[];
  totalBags: string;
  isBooked: string;
  billNumber: string;
  bitliNumber: string;
  billBook: string;
  biltiBook: string;
  netWeightKg: string;
  averageWeightPerBag: string;
  createdBy: string;
  remarks: string;
};

export type DispatchReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type DispatchReportResult = {
  nikasiGatePasses: DispatchReportRow[];
};

export type NikasiGatePassReportBagSize = {
  size?: string;
  variety?: string;
  quantityIssued?: number;
};

export type NikasiGatePassReportItem = {
  _id: string;
  dispatchLedgerId?: {
    _id?: string;
    name?: string;
    address?: string;
    mobileNumber?: string;
  };
  createdBy?: {
    _id?: string;
    name?: string;
  };
  gatePassNo: number;
  manualGatePassNumber?: number;
  isBooked?: boolean;
  billNumber?: number;
  bitliNumber?: number;
  billBook?: string;
  biltiBook?: string;
  category: string;
  date: string;
  from: string;
  to?: string;
  truckNumber?: string;
  bagSize?: NikasiGatePassReportBagSize[];
  totalBags?: number;
  remarks?: string;
  netWeight?: number;
  averageWeightPerBag?: number;
};

export type GetNikasiGatePassReportResponse = {
  success: boolean;
  message?: string;
  data: {
    nikasiGatePasses: NikasiGatePassReportItem[];
  };
};
