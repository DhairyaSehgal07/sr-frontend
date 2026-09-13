import { Loader2 } from 'lucide-react';

import { useGradingIncomingGatePassLink } from '@/features/grading/api/use-grading-incoming-gate-pass-link';
import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';
import { Button } from '@/components/ui/button';

type GradingIncomingGatePassActionCellProps = {
  gradingGatePassId: string;
  farmerStorageLinkId: string;
  incomingGatePass: GradingSelectIncomingGatePasses;
};

export function GradingIncomingGatePassActionCell({
  gradingGatePassId,
  farmerStorageLinkId,
  incomingGatePass,
}: GradingIncomingGatePassActionCellProps) {
  const { link, delink, isRowPending } = useGradingIncomingGatePassLink({
    gradingGatePassId,
    farmerStorageLinkId,
  });

  const isGraded = incomingGatePass.status === 'GRADED';
  const incomingGatePassId = incomingGatePass._id;
  const isPending = isRowPending(incomingGatePassId);

  const handleClick = () => {
    const input = { gradingGatePassId, incomingGatePassId };
    void (isGraded ? delink(input) : link(input));
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending || incomingGatePassId.startsWith('linked-')}
      onClick={handleClick}
      aria-label={
        isGraded
          ? `Delink gate pass ${incomingGatePass.manualGatePassNumber}`
          : `Link gate pass ${incomingGatePass.manualGatePassNumber}`
      }
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : isGraded ? 'DELINK' : 'Link'}
    </Button>
  );
}
