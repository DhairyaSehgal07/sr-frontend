import type { LucideIcon } from 'lucide-react';
import { Package, Sprout, Tag } from 'lucide-react';

import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { formatBags } from '@/features/finances/lib/format';

import type { QuantityMode, StockMatrix } from '../lib/stock-matrix';

const MODE_COPY: Record<QuantityMode, { label: string; caption: string }> = {
  current: { label: 'Total inventory (current)', caption: 'Bags in storage' },
  initial: { label: 'Total inventory (initial)', caption: 'Bags received' },
  outgoing: { label: 'Total inventory (outgoing)', caption: 'Bags issued' },
};

function MetricIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
      <Icon className="size-4 text-primary" aria-hidden="true" />
    </div>
  );
}

export function StockSummaryCards({ matrix, mode }: { matrix: StockMatrix; mode: QuantityMode }) {
  const copy = MODE_COPY[mode];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card size="sm" className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {copy.label}
          </CardDescription>
          <CardAction>
            <MetricIcon icon={Package} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="font-heading text-2xl font-semibold tracking-tight text-primary tabular-nums">
            {formatBags(matrix.grandTotal)}
          </p>
          <p className="text-sm text-muted-foreground">{copy.caption}</p>
        </CardContent>
      </Card>

      <Card size="sm" className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            Top variety
          </CardDescription>
          <CardAction>
            <MetricIcon icon={Sprout} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="truncate font-heading text-2xl font-semibold tracking-tight text-foreground">
            {matrix.topVariety?.name ?? '—'}
          </p>
          <p className="text-sm text-muted-foreground">
            {matrix.topVariety ? `${formatBags(matrix.topVariety.total)} bags` : 'No stock yet'}
          </p>
        </CardContent>
      </Card>

      <Card size="sm" className="gap-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            Top bag size
          </CardDescription>
          <CardAction>
            <MetricIcon icon={Tag} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="truncate font-heading text-2xl font-semibold tracking-tight text-foreground">
            {matrix.topSize?.name ?? '—'}
          </p>
          <p className="text-sm text-muted-foreground">
            {matrix.topSize ? `${formatBags(matrix.topSize.total)} bags` : 'No stock yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
