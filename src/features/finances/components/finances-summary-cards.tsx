import { Banknote, CircleDollarSign, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

import { formatInr } from '../lib/format';
import type { FinancesTotals } from '../types';

type SummaryMetric = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function buildMetrics(totals: FinancesTotals): SummaryMetric[] {
  return [
    {
      label: 'Sales',
      value: formatInr(totals.sales),
      description: 'Auto-posted from dispatch vouchers',
      icon: CircleDollarSign,
    },
    {
      label: 'Recovered',
      value: formatInr(totals.recovered),
      description: 'Collections against dispatch ledgers',
      icon: Banknote,
    },
    {
      label: 'Outstanding',
      value: formatInr(totals.outstanding),
      description: 'Receivable still due from parties',
      icon: Wallet,
    },
  ];
}

export function FinancesSummaryCards({ totals }: { totals: FinancesTotals }) {
  const metrics = buildMetrics(totals);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.label} size="sm" className="gap-0">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <p className="text-right text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {metric.value}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
