export type LocationWiseFarmerEntry = {
  gatePassId: string;
  gatePassNo: number;
  farmerName: string;
  farmerAccountNumber: number | string;
  bagSize: string;
  bagType: string;
  currentQuantity: number;
  initialQuantity: number;
};

export type LocationWiseVarietySummaryItem = {
  variety: string;
  currentQuantity: number;
  initialQuantity: number;
};

export type LocationWiseVarietyNode = {
  variety: string;
  entries: LocationWiseFarmerEntry[];
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};

export type LocationWiseRowNode = {
  row: string;
  varieties: LocationWiseVarietyNode[];
  varietySummary: LocationWiseVarietySummaryItem[];
  varietyCount: number;
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};

export type LocationWiseFloorNode = {
  floor: string;
  rows: LocationWiseRowNode[];
  varietySummary: LocationWiseVarietySummaryItem[];
  varietyCount: number;
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};

export type LocationWiseChamberNode = {
  chamber: string;
  floors: LocationWiseFloorNode[];
  varietySummary: LocationWiseVarietySummaryItem[];
  varietyCount: number;
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};

export type LocationWiseStorageTree = {
  chambers: LocationWiseChamberNode[];
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};
