/** One row per outgoing gate pass from `GET /outgoing-gate-pass/report` */
export type OutgoingReportOrderDetail = {
  size: string;
  bagType: string;
  quantityIssued: number;
  quantityAvailable: number;
  weightInKg: number;
  chamber: string;
  floor: string;
  row: string;
};

export type OutgoingReportRow = {
  _id: string;
  name: string;
  address: string;
  accountNumber: string;
  manualGatePassNumber: string;
  gatePassNo: string;
  date: string;
  variety: string;
  status: string;
  category: string;
  from: string;
  to: string;
  truckNumber: string;
  transportCompany: string;
  lsNumber: string;
  driverName: string;
  driverMobile: string;
  owner: string;
  shed: string;
  preSowingTreatment: string;
  billNumber: string;
  biltiNumber: string;
  billBook: string;
  biltiBook: string;
  costPerBag: string;
  orderDetails: OutgoingReportOrderDetail[];
  totalBags: string;
  netWeightKg: string;
  createdBy: string;
  remarks: string;
};

export type OutgoingReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type OutgoingReportResult = {
  outgoingGatePasses: OutgoingReportRow[];
};

export type OutgoingGatePassReportOrderDetail = {
  size?: string;
  bagType?: string;
  quantityIssued?: number;
  quantityAvailable?: number;
  weightInKg?: number;
  chamber?: string;
  floor?: string;
  row?: string;
};

export type OutgoingGatePassReportFarmer = {
  _id?: string;
  accountNumber?: number | string;
  name?: string;
  address?: string;
};

export type OutgoingGatePassReportFarmerStorageLink = {
  _id?: string;
  accountNumber?: number | string;
  farmerId?: OutgoingGatePassReportFarmer;
};

export type OutgoingGatePassReportItem = {
  _id: string;
  farmerStorageLinkId?: OutgoingGatePassReportFarmerStorageLink;
  createdBy?: {
    _id?: string;
    name?: string;
  };
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  variety?: string;
  from?: string;
  to?: string;
  truckNumber?: string;
  transportCompany?: string;
  LSNumber?: string;
  driverName?: string;
  driverMobile?: string;
  owner?: string;
  shed?: string;
  billNumber?: number;
  biltiNumber?: number;
  billBook?: string;
  billBookId?: string;
  biltiBook?: string;
  category?: string;
  costPerBag?: number;
  orderDetails?: OutgoingGatePassReportOrderDetail[];
  totalBags?: number;
  remarks?: string;
  'pre-sowing-treatment'?: boolean;
  status?: string;
};

export type GetOutgoingGatePassReportResponse = {
  success: boolean;
  message?: string;
  data: {
    outgoingGatePasses: OutgoingGatePassReportItem[];
  };
};
