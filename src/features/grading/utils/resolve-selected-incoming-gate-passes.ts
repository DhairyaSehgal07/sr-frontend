import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';

export function resolveSelectedIncomingGatePasses(
  selectedIds: readonly string[],
  allGatePasses: readonly GradingSelectIncomingGatePasses[],
): GradingSelectIncomingGatePasses[] {
  const gatePassById = new Map(allGatePasses.map((gatePass) => [gatePass._id, gatePass]));

  return selectedIds.flatMap((id) => {
    const gatePass = gatePassById.get(id);
    return gatePass ? [gatePass] : [];
  });
}
