import { Package } from 'lucide-react';
import { lookupOutgoingWeight } from '@/features/outgoing/utils/group-outgoing-items';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { groupItemsByVariety } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { cn } from '@/lib/utils';

const weightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

type AllocationReviewByVarietyProps = {
  items: TransferStockItem[];
  className?: string;
  weightsBySize?: Record<string, number | undefined>;
};

function AllocationTable({
  items,
  weightsBySize,
}: {
  items: TransferStockItem[];
  weightsBySize?: Record<string, number | undefined>;
}) {
  const showWeight = weightsBySize != null;

  return (
    <table className="w-full caption-bottom text-sm">
      <thead className="border-b border-border/40 bg-muted/20">
        <tr className="text-left">
          <th className="h-9 px-3 font-medium text-muted-foreground">Voucher</th>
          <th className="h-9 px-3 font-medium text-muted-foreground">Size</th>
          <th className="h-9 px-3 font-medium text-muted-foreground">Location</th>
          <th className="h-9 px-3 text-right font-medium text-muted-foreground">Qty</th>
          {showWeight ? (
            <th className="h-9 px-3 text-right font-medium text-muted-foreground">Weight (kg)</th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const weight = showWeight
            ? lookupOutgoingWeight(weightsBySize ?? {}, item.variety, item.bagSize)
            : undefined;

          return (
            <tr
              key={`${item.storageGatePassId}-${item.bagSize}-${item.bagIndex}-${index}`}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-3 py-2.5 font-mono text-sm tabular-nums">#{item.gatePassNo}</td>
              <td className="px-3 py-2.5 font-medium">{item.bagSize}</td>
              <td className="px-3 py-2.5 text-sm text-muted-foreground">
                Ch {item.location.chamber} · F {item.location.floor} · R {item.location.row}
              </td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                {item.quantity.toLocaleString('en-IN')}
              </td>
              {showWeight ? (
                <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {weight != null ? weightFormatter.format(weight) : '—'}
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function AllocationReviewByVariety({
  items,
  className,
  weightsBySize,
}: AllocationReviewByVarietyProps) {
  const groups = groupItemsByVariety(items);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">No allocations selected.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groups.map((group) => {
        const subtotal = group.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <div
            key={group.variety}
            className="overflow-hidden rounded-xl border border-border/50 bg-card"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/30 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Package className="size-3.5" />
                </span>
                <span
                  className="truncate text-sm font-semibold text-foreground"
                  title={group.variety}
                >
                  {group.variety}
                </span>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                {subtotal.toLocaleString('en-IN')} <span className="font-normal">bags</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <AllocationTable items={group.items} weightsBySize={weightsBySize} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
