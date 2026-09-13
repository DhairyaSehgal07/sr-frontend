import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';
import {
  formatIncomingWeightKg,
  incomingNetWeightKg,
} from '@/features/grading/utils/incoming-net-weight';
import { cn } from '@/lib/utils';

type IncomingGatePassesSummaryCardProps = {
  gatePasses: readonly GradingSelectIncomingGatePasses[];
  className?: string;
};

function formatBags(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function IncomingGatePassesSummaryCard({
  gatePasses,
  className,
}: IncomingGatePassesSummaryCardProps) {
  if (gatePasses.length === 0) return null;

  const totalBags = gatePasses.reduce((sum, gatePass) => sum + gatePass.bagsReceived, 0);
  const selectedNetWeights = gatePasses.map(incomingNetWeightKg);
  const totalNetWeightKg = selectedNetWeights.reduce<number>(
    (sum, weight) => sum + (weight ?? 0),
    0,
  );
  const hasNetWeight = selectedNetWeights.some((weight) => weight != null);

  return (
    <div className={cn('w-full max-w-xl', className)}>
      <p className="mb-2 text-sm font-semibold text-foreground">Selected incoming gate passes</p>
      <div
        className="overflow-x-auto rounded-lg border border-border bg-card"
        aria-label="Selected incoming gate passes"
      >
        <table className="w-full min-w-[420px] text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-muted-foreground">
                Gate Pass #
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-medium text-muted-foreground">
                Bags
              </th>
              <th className="px-4 py-2.5 text-right text-sm font-medium text-muted-foreground">
                Incoming net weight
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {gatePasses.map((gatePass) => {
              const netWeightKg = incomingNetWeightKg(gatePass);

              return (
                <tr key={gatePass._id}>
                  <td className="px-4 py-2.5 text-sm font-semibold text-foreground tabular-nums">
                    #{gatePass.gatePassNo}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-muted-foreground tabular-nums">
                    {formatBags(gatePass.bagsReceived)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-muted-foreground tabular-nums">
                    {netWeightKg == null ? (
                      '—'
                    ) : (
                      <>
                        {formatIncomingWeightKg(netWeightKg)}
                        <span className="ml-1 text-xs font-normal">kg</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-border">
            <tr>
              <td className="px-4 py-2.5 text-sm font-semibold text-foreground">Total</td>
              <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">
                {formatBags(totalBags)}
              </td>
              <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">
                {hasNetWeight ? (
                  <>
                    {formatIncomingWeightKg(totalNetWeightKg)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
                  </>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
