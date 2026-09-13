export type BookingSizeBreakdown = {
  size: string;
  quantity: number;
};

export type BookingVarietySummary = {
  variety: string;
  quantity: number;
  sizes: BookingSizeBreakdown[];
};

export type BookingSummaryTableRow = {
  variety: string;
  values: Record<string, number>;
  total: number;
};

export type BookingSummaryTableData = {
  sizeNames: string[];
  rows: BookingSummaryTableRow[];
  totals: Record<string, number>;
  grandTotal: number;
};
