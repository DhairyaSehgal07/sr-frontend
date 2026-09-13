export type SummaryBagTypeBreakdown = {
  bagType: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
};

export type SummarySizeBreakdown = {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  byBagType?: SummaryBagTypeBreakdown[];
};

export type SummaryVariety = {
  variety: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  sizes: SummarySizeBreakdown[];
};

export type SummaryResponse = {
  success: boolean;
  data: SummaryVariety[];
  message?: string;
};
