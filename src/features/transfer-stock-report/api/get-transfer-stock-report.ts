import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  GetTransferStockReportResponse,
  TransferStockReportParams,
  TransferStockReportResult,
  TransferStockReportRow,
} from './types';

export function buildTransferStockReportParams(
  params: TransferStockReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

function asString(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function normalizeTransferStockReportRow(row: Record<string, unknown>): TransferStockReportRow {
  return {
    _id: asString(row._id),
    date: asString(row.date),
    gatePassNo: asString(row.gatePassNo),
    manualGatePassNumber: asString(row.manualGatePassNumber),
    from: asString(row.fromName ?? row.from),
    fromAccountNumber: asString(row.fromAccountNumber),
    to: asString(row.toName ?? row.to),
    toAccountNumber: asString(row.toAccountNumber),
    variety: asString(row.variety),
    category: asString(row.category),
    stage: asString(row.stage),
    truckNumber: asString(row.truckNumber),
    totalBags: asString(row.totalBags),
    outgoingGatePassNo: asString(row.outgoingGatePassNo),
    destinationStorageGatePassNo: asString(row.destinationStorageGatePassNo),
    remarks: asString(row.remarks),
    createdBy: asString(row.createdBy),
  };
}

export async function getTransferStockReport(
  params: TransferStockReportParams = {},
): Promise<TransferStockReportResult> {
  try {
    const { data } = await apiClient.get<GetTransferStockReportResponse>('/transfer-stock/report', {
      params: buildTransferStockReportParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load transfer stock report');
    }

    return {
      columns: data.data.columns ?? [],
      transferStockGatePasses: (data.data.transferStockGatePasses ?? []).map((row) =>
        normalizeTransferStockReportRow(row as Record<string, unknown>),
      ),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load transfer stock report'), {
      cause: error,
    });
  }
}
