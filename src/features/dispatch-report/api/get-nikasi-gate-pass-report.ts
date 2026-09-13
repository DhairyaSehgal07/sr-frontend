import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  DispatchReportBagSizeItem,
  DispatchReportParams,
  DispatchReportResult,
  DispatchReportRow,
  GetNikasiGatePassReportResponse,
  NikasiGatePassReportItem,
} from './types';

export function buildNikasiGatePassReportParams(
  params: DispatchReportParams,
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function asQuantity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBagSize(pass: NikasiGatePassReportItem): DispatchReportBagSizeItem[] {
  if (!Array.isArray(pass.bagSize)) return [];

  return pass.bagSize.map((item) => ({
    size: asString(item.size),
    variety: asString(item.variety),
    quantityIssued: asQuantity(item.quantityIssued),
  }));
}

function normalizeNikasiGatePass(pass: NikasiGatePassReportItem): DispatchReportRow {
  const ledger = asRecord(pass.dispatchLedgerId);
  const createdBy = asRecord(pass.createdBy);
  const bagSize = normalizeBagSize(pass);
  const totalBags = pass.totalBags ?? bagSize.reduce((sum, item) => sum + item.quantityIssued, 0);

  return {
    _id: asString(pass._id),
    name: asString(ledger?.name),
    address: asString(ledger?.address),
    mobileNumber: asString(ledger?.mobileNumber),
    manualGatePassNumber: asString(pass.manualGatePassNumber),
    gatePassNo: asString(pass.gatePassNo),
    date: asString(pass.date),
    category: asString(pass.category),
    from: asString(pass.from),
    to: asString(pass.to),
    truckNumber: asString(pass.truckNumber),
    bagSize,
    totalBags: asString(totalBags),
    isBooked: pass.isBooked == null ? '' : pass.isBooked ? 'true' : 'false',
    billNumber: asString(pass.billNumber),
    bitliNumber: asString(pass.bitliNumber),
    billBook: asString(pass.billBook),
    biltiBook: asString(pass.biltiBook),
    netWeightKg: asString(pass.netWeight),
    averageWeightPerBag: asString(pass.averageWeightPerBag),
    createdBy: asString(createdBy?.name),
    remarks: asString(pass.remarks),
  };
}

export async function getNikasiGatePassReport(
  params: DispatchReportParams = {},
): Promise<DispatchReportResult> {
  try {
    const { data } = await apiClient.get<GetNikasiGatePassReportResponse>(
      '/nikasi-gate-pass/report',
      { params: buildNikasiGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load dispatch report');
    }

    return {
      nikasiGatePasses: (data.data.nikasiGatePasses ?? []).map(normalizeNikasiGatePass),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load dispatch report'), {
      cause: error,
    });
  }
}
