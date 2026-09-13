/** Flattened row returned by `GET /transfer-stock/report` */
export type TransferStockReportRow = {
  _id: string;
  date: string;
  gatePassNo: string;
  manualGatePassNumber: string;
  from: string;
  fromAccountNumber: string;
  to: string;
  toAccountNumber: string;
  variety: string;
  category: string;
  stage: string;
  truckNumber: string;
  totalBags: string;
  outgoingGatePassNo: string;
  destinationStorageGatePassNo: string;
  remarks: string;
  createdBy: string;
};

export type TransferStockReportColumn = {
  accessorKey: string;
  header: string;
};

export type TransferStockReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type TransferStockReportResult = {
  columns: TransferStockReportColumn[];
  transferStockGatePasses: TransferStockReportRow[];
};

export type GetTransferStockReportResponse = {
  success: boolean;
  message?: string;
  data: TransferStockReportResult;
};
