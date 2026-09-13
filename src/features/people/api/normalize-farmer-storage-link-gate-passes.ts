import type { GradingGatePass } from '@/features/grading/api/types';

import type {
  FarmerStorageLinkGatePassesApiData,
  FarmerStorageLinkGatePassesResult,
} from './gate-pass-types';

function normalizeGradingGatePasses(grading: GradingGatePass[] = []): GradingGatePass[] {
  return grading.map((gatePass) => ({
    ...gatePass,
    incomingGatePassIds: gatePass.incomingGatePassIds.map((incoming) => ({
      ...incoming,
      grossWeightKg: incoming.grossWeightKg ?? incoming.weightSlip?.grossWeightKg ?? 0,
      tareWeightKg: incoming.tareWeightKg ?? incoming.weightSlip?.tareWeightKg ?? 0,
    })),
  }));
}

export function normalizeFarmerStorageLinkGatePasses(
  data: FarmerStorageLinkGatePassesApiData,
): FarmerStorageLinkGatePassesResult {
  return {
    incoming: data.incoming ?? [],
    grading: normalizeGradingGatePasses(data.grading),
    storage: data.storage ?? [],
    nikasi: data.nikasi ?? [],
    outgoing: data.outgoing ?? [],
    totalIncomingBags: data.totalIncomingBags ?? 0,
    totalGradingBags: data.totalGradingBags ?? 0,
    totalStorageBags: data.totalStorageBags ?? 0,
  };
}
