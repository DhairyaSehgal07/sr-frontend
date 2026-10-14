export type StockFilterOption = {
  _id: string;
  name: string;
};

export type GetStockFiltersResponse = {
  success: boolean;
  data: StockFilterOption[];
  message?: string;
};

export type StockFilterBody = {
  name: string;
};

export type MutateStockFilterResponse = {
  success: boolean;
  data: StockFilterOption | null;
  message?: string;
};

export type UpdateStockFilterInput = {
  id: string;
  body: StockFilterBody;
};
