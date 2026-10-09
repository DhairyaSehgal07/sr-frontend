import type { FinanceSummary } from '@/features/finances/api/types';
import { SaleStatusBadge } from '@/features/finances/components/sale-status-badge';
import { formatInr, paiseToRupees } from '@/features/finances/lib/format';

import type { PartyGatePass } from '../api/types';
import { MaterialFigures } from './material-summary';
import { TotalCell } from './total-cell';

type LedgerTotalsProps = {
  summary: FinanceSummary;
  passes: readonly PartyGatePass[] | null;
};

export function LedgerTotals({ summary, passes }: LedgerTotalsProps) {
  const settled = summary.outstandingPaise === 0;

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid sm:grid-cols-3 sm:gap-px sm:divide-y-0 sm:bg-border">
      <TotalCell
        label="Outstanding"
        badge={settled ? <SaleStatusBadge status="settled" /> : undefined}
        value={formatInr(paiseToRupees(summary.outstandingPaise))}
      />
      <TotalCell label="Billed" value={formatInr(paiseToRupees(summary.billedPaise))} />
      <TotalCell label="Recovered" value={formatInr(paiseToRupees(summary.recoveredPaise))} />
      <MaterialFigures passes={passes} />
    </div>
  );
}
