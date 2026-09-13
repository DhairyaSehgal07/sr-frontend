/** Flattened row returned by `GET /incoming-gate-pass/report` */
export type IncomingGatePassReportRow = {
  name: string;
  address: string;
  manualGatePassNumber: string;
  gatePassNo: string;
  date: string;
  variety: string;
  stage: string;
  truckNumber: string;
  bags: string;
  slipNumber: string;
  grossWeightKg: string;
  tareWeightKg: string;
  bardanaWeightKg: string;
  netWeightKg: string;
  remarks: string;
  status: string;
  createdBy: string;
};

export type IncomingGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type IncomingGatePassReportResult = {
  incomingGatePasses: IncomingGatePassReportRow[];
};

export type GetIncomingGatePassReportResponse = {
  success: boolean;
  data: IncomingGatePassReportResult;
  message?: string;
};
