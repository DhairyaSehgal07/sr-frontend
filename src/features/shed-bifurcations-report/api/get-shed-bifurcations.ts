import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  GetShedBifurcationsResponse,
  ShedBifurcationEvent,
  ShedBifurcationIssuedLine,
  ShedBifurcationLine,
  ShedBifurcationParams,
  ShedBifurcationRow,
  ShedOutgoingGatePass,
} from './types';

export function buildShedBifurcationParams(params: ShedBifurcationParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  return query;
}

function asText(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function asQuantity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeIssuedLines(
  lines: ShedOutgoingGatePass['initialBagLines'],
): ShedBifurcationIssuedLine[] {
  if (!Array.isArray(lines)) return [];
  return lines.map((line) => ({
    size: asText(line?.size),
    quantity: asQuantity(line?.quantity),
  }));
}

function normalizeLines(lines: ShedBifurcationEvent['lines']): ShedBifurcationLine[] {
  if (!Array.isArray(lines)) return [];
  return lines.map((line) => ({
    toSize: asText(line?.toSize),
    quantity: asQuantity(line?.quantity),
  }));
}

export function flattenOutgoingGatePasses(passes: ShedOutgoingGatePass[]): ShedBifurcationRow[] {
  return passes.flatMap((pass) => {
    const bifurcations = pass.bifurcations ?? [];
    if (bifurcations.length === 0) return [];

    const farmerLink = pass.farmerStorageLinkId;
    const farmer = farmerLink?.farmerId;
    const initialBagLines = normalizeIssuedLines(pass.initialBagLines);
    const issuedText = initialBagLines.map((line) => `${line.size} ${line.quantity}`).join(', ');
    const passManualNumber = asText(pass.manualGatePassNumber);
    const passRemarks = asText(pass.remarks);

    return bifurcations.map((item, index) => {
      const lines = normalizeLines(item.lines);
      const bifurcationId = asText(item._id);

      return {
        id: bifurcationId || `${asText(pass.outgoingGatePassId)}-${index}`,
        createdAt: asText(item.createdAt),
        gatePassNo: asQuantity(pass.gatePassNo),
        manualGatePassNumber: asText(item.manualGatePassNumber) || passManualNumber,
        shed: asText(pass.shed),
        variety: asText(pass.variety),
        farmerName: asText(farmer?.name),
        accountNumber: asText(farmerLink?.accountNumber),
        initialBagLines,
        issuedText,
        fromSize: asText(item.fromSize),
        lines,
        linesText: lines.map((line) => `${line.toSize} ${line.quantity}`).join(', '),
        lineQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
        remarks: asText(item.remarks) || passRemarks,
      };
    });
  });
}

export async function getShedBifurcations(
  params: ShedBifurcationParams = {},
): Promise<ShedBifurcationRow[]> {
  try {
    const { data } = await apiClient.get<GetShedBifurcationsResponse>(
      '/outgoing-gate-pass/bifurcations',
      { params: buildShedBifurcationParams(params) },
    );

    if (data.success === false) {
      throw new Error(data.message ?? 'Failed to load shed bifurcations');
    }

    return flattenOutgoingGatePasses(data.data?.outgoingGatePasses ?? []);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load shed bifurcations'), {
      cause: error,
    });
  }
}
