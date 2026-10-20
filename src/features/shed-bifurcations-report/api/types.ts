export type ShedBifurcationIssuedLine = {
  size: string;
  quantity: number;
};

export type ShedBifurcationLine = {
  toSize: string;
  quantity: number;
};

export type ShedBifurcationFarmer = {
  _id?: string;
  name?: string;
  address?: string;
};

export type ShedBifurcationFarmerLink = {
  _id?: string;
  accountNumber?: number | string;
  farmerId?: ShedBifurcationFarmer;
};

export type ShedBifurcationEvent = {
  _id?: string;
  fromSize?: string;
  lines?: Array<{ toSize?: string; quantity?: number }>;
  remarks?: string;
  manualGatePassNumber?: number | string;
  createdAt?: string;
};

export type ShedOutgoingGatePass = {
  outgoingGatePassId?: string;
  gatePassNo?: number;
  manualGatePassNumber?: number | string;
  shed?: string;
  variety?: string;
  remarks?: string;
  farmerStorageLinkId?: ShedBifurcationFarmerLink;
  initialBagLines?: Array<{ size?: string; quantity?: number }>;
  bifurcations?: ShedBifurcationEvent[];
};

export type GetShedBifurcationsResponse = {
  success: boolean;
  data?: {
    outgoingGatePasses?: ShedOutgoingGatePass[];
  };
  message?: string;
};

export type ShedBifurcationParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type ShedBifurcationRow = {
  id: string;
  createdAt: string;
  gatePassNo: number;
  manualGatePassNumber: string;
  shed: string;
  variety: string;
  farmerName: string;
  accountNumber: string;
  initialBagLines: ShedBifurcationIssuedLine[];
  issuedText: string;
  fromSize: string;
  lines: ShedBifurcationLine[];
  linesText: string;
  lineQuantity: number;
  remarks: string;
};
