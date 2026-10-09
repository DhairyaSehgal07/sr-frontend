import { formatBags } from '@/features/finances/lib/format';
import type { PartyGatePass } from '../api/types';
import { formatWeight, materialFromPasses } from './lib';
import { TotalCell } from './total-cell';

type MaterialFiguresProps = {
  passes: readonly PartyGatePass[] | null;
};

export function MaterialFigures({ passes }: MaterialFiguresProps) {
  const totals = passes ? materialFromPasses(passes) : null;

  return (
    <>
      <TotalCell label="Gate passes" value={totals ? formatBags(totals.passCount) : '—'} />
      <TotalCell
        label="Bags"
        value={
          totals ? (
            <>
              {formatBags(totals.bags)}{' '}
              <span className="font-normal text-muted-foreground">bags</span>
            </>
          ) : (
            '—'
          )
        }
      />
      <TotalCell
        label="Net weight"
        value={
          totals ? (
            <>
              {formatWeight(totals.netWeight)}{' '}
              <span className="font-normal text-muted-foreground">kg</span>
            </>
          ) : (
            '—'
          )
        }
      />
    </>
  );
}
