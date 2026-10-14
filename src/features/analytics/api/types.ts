export type ColdStoreStockSize = {
  name: string;
  currentQuantity: number;
  initialQuantity: number;
};

export type ColdStoreStock = {
  _id: string;
  variety: string;
  stockFilter?: string | null;
  size: ColdStoreStockSize;
};

export type ColdStoreStockBody = {
  variety: string;
  stockFilter?: string;
  size: ColdStoreStockSize;
};

export type GetColdStoreStockResponse = {
  success: boolean;
  data: ColdStoreStock[];
  message?: string;
};

export type MutateColdStoreStockResponse = {
  success: boolean;
  data: ColdStoreStock | null;
  message?: string;
};

export type UpdateColdStoreStockInput = {
  id: string;
  body: ColdStoreStockBody;
};
