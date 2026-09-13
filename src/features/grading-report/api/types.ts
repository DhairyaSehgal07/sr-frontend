export type GradingGatePassReportOrderDetail = {
  size: string;
  bagType: string;
  quantity: number;
  weightPerBagKg: number;
};

export type GradingGatePassReportFarmerStorageLink =
  | string
  | {
      _id?: string;
      accountNumber?: number | string;
      farmerId?:
        | string
        | {
            _id?: string;
            name?: string;
            address?: string;
          };
      farmer?:
        | string
        | {
            _id?: string;
            name?: string;
            address?: string;
          };
    };

export type GradingGatePassReportIncomingGatePass =
  | string
  | {
      _id: string;
      manualGatePassNumber: number;
      bagsReceived: number;
      stage: string;
      category: string;
      netWeightKg: number | string;
    };

export type GradingGatePassReportCreatedBy =
  | string
  | {
      _id: string;
      name: string;
    };

export type GradingGatePassReportRow = {
  _id: string;
  farmerStorageLinkId: GradingGatePassReportFarmerStorageLink;
  farmer?: string;
  name?: string;
  accountNumber?: number | string;
  address?: string;
  incomingGatePassIds: GradingGatePassReportIncomingGatePass[];
  createdBy: GradingGatePassReportCreatedBy;
  gatePassNo: number;
  manualGatePassNumber: number;
  date: string;
  variety: string;
  orderDetails: GradingGatePassReportOrderDetail[];
  totalBags: number;
  incomingNetWeightKg: number | string;
  netWeightKg: number | string;
  wastageKg: number | string;
  wastagePercentage: number | string;
  remarks: string;
};

export type GradingGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type GradingGatePassReportResult = {
  gradingGatePasses: GradingGatePassReportRow[];
};

export type GetGradingGatePassReportResponse = {
  success: boolean;
  data: GradingGatePassReportResult;
  message?: string;
};
