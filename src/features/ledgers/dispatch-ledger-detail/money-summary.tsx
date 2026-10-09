import type { LucideIcon } from 'lucide-react';
import { Banknote, CircleDollarSign, Wallet } from 'lucide-react';

import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import type { FinanceSummary } from '@/features/finances/api/types';
import { SaleStatusBadge } from '@/features/finances/components/sale-status-badge';
import { formatBags, formatInr, paiseToRupees } from '@/features/finances/lib/format';

import { countNoun } from './lib';

type MoneySummaryProps = {
  summary: FinanceSummary;
};

export function MoneySummary({ summary }: MoneySummaryProps) {
  const settled = summary.outstandingPaise === 0;
  const metrics: Array<{
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    lead?: boolean;
    settled?: boolean;
  }> = [
    {
      label: 'Outstanding',
      value: formatInr(paiseToRupees(summary.outstandingPaise)),
      description: settled ? 'Nothing left to collect' : 'Still due from this party',
      icon: Wallet,
      lead: true,
      settled,
    },
    {
      label: 'Billed',
      value: formatInr(paiseToRupees(summary.billedPaise)),
      description: `${formatBags(summary.saleCount)} ${countNoun(summary.saleCount, 'sale', 'sales')}`,
      icon: CircleDollarSign,
    },
    {
      label: 'Recovered',
      value: formatInr(paiseToRupees(summary.recoveredPaise)),
      description: `${formatBags(summary.recoveryCount)} ${countNoun(summary.recoveryCount, 'recovery', 'recoveries')}`,
      icon: Banknote,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card
            key={metric.label}
            size="sm"
            className={metric.lead ? 'col-span-2 gap-0 sm:col-span-1' : 'gap-0'}
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {metric.label}
                {metric.settled ? <SaleStatusBadge status="settled" /> : null}
              </CardDescription>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <p
                className={
                  metric.lead
                    ? 'text-right text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl'
                    : 'text-right text-base font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl'
                }
              >
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
