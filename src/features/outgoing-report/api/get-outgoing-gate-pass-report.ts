import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  GetOutgoingGatePassReportResponse,
  OutgoingGatePassReportItem,
  OutgoingGatePassReportOrderDetail,
  OutgoingReportOrderDetail,
  OutgoingReportParams,
  OutgoingReportResult,
  OutgoingReportRow,
} from './types';

export function buildOutgoingGatePassReportParams(
  params: OutgoingReportParams,
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

function asQuantity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOrderDetail(item: OutgoingGatePassReportOrderDetail): OutgoingReportOrderDetail {
  return {
    size: asString(item.size),
    bagType: asString(item.bagType),
    quantityIssued: asQuantity(item.quantityIssued),
    quantityAvailable: asQuantity(item.quantityAvailable),
    weightInKg: asQuantity(item.weightInKg),
    chamber: asString(item.chamber),
    floor: asString(item.floor),
    row: asString(item.row),
  };
}

function normalizeOutgoingGatePass(pass: OutgoingGatePassReportItem): OutgoingReportRow {
  const farmerLink = pass.farmerStorageLinkId;
  const farmer = farmerLink?.farmerId;
  const orderDetails = Array.isArray(pass.orderDetails)
    ? pass.orderDetails.map(normalizeOrderDetail)
    : [];
  const totalBags =
    pass.totalBags ?? orderDetails.reduce((sum, item) => sum + item.quantityIssued, 0);
  const netWeightKg = orderDetails.reduce((sum, item) => sum + item.weightInKg, 0);
  const preSowing = pass['pre-sowing-treatment'];

  return {
    _id: asString(pass._id),
    name: asString(farmer?.name),
    address: asString(farmer?.address),
    accountNumber: asString(farmerLink?.accountNumber ?? farmer?.accountNumber),
    manualGatePassNumber: asString(pass.manualGatePassNumber),
    gatePassNo: asString(pass.gatePassNo),
    date: asString(pass.date),
    variety: asString(pass.variety),
    status: asString(pass.status),
    category: asString(pass.category),
    from: asString(pass.from),
    to: asString(pass.to),
    truckNumber: asString(pass.truckNumber),
    transportCompany: asString(pass.transportCompany),
    lsNumber: asString(pass.LSNumber),
    driverName: asString(pass.driverName),
    driverMobile: asString(pass.driverMobile),
    owner: asString(pass.owner),
    shed: asString(pass.shed),
    preSowingTreatment: preSowing == null ? '' : preSowing ? 'true' : 'false',
    billNumber: asString(pass.billNumber),
    biltiNumber: asString(pass.biltiNumber),
    billBook: asString(pass.billBook),
    biltiBook: asString(pass.biltiBook),
    costPerBag: asString(pass.costPerBag),
    orderDetails,
    totalBags: asString(totalBags),
    netWeightKg: asString(netWeightKg),
    createdBy: asString(pass.createdBy?.name),
    remarks: asString(pass.remarks),
  };
}

export async function getOutgoingGatePassReport(
  params: OutgoingReportParams = {},
): Promise<OutgoingReportResult> {
  try {
    const { data } = await apiClient.get<GetOutgoingGatePassReportResponse>(
      '/outgoing-gate-pass/report',
      { params: buildOutgoingGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load outgoing report');
    }

    return {
      outgoingGatePasses: (data.data.outgoingGatePasses ?? []).map(normalizeOutgoingGatePass),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outgoing report'), {
      cause: error,
    });
  }
}
