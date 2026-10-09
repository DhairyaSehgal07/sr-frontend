import type { LucideIcon } from 'lucide-react';
import { Package, Scale, Truck } from 'lucide-react';

import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { formatBags } from '@/features/finances/lib/format';
import type { PartyGatePass } from '../api/types';
import { formatWeight, materialFromPasses } from './lib';

type MaterialSummaryProps = {
  passes: readonly PartyGatePass[];
  bookName?: string;
};

export function MaterialSummary({ passes, bookName }: MaterialSummaryProps) {
  const totals = materialFromPasses(passes);
  const scope = bookName ? `In ${bookName}` : 'Issued to this party';

  const metrics: Array<{
    label: string;
    value: string;
    unit?: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      label: 'Gate passes',
      value: formatBags(totals.passCount),
      description: scope,
      icon: Truck,
    },
    {
      label: 'Bags',
      value: formatBags(totals.bags),
      unit: 'bags',
      description: 'Bags loaded on those passes',
      icon: Package,
    },
    {
      label: 'Net weight',
      value: formatWeight(totals.netWeight),
      unit: 'kg',
      description: 'Weight dispatched',
      icon: Scale,
    },
  ];

  return (
    <>
      <Card size="sm" className="gap-0 sm:hidden">
        <CardContent className="flex flex-col gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-right text-sm font-medium text-foreground tabular-nums">
                {metric.value}
                {metric.unit ? (
                  <>
                    {' '}
                    <span className="font-normal text-muted-foreground">{metric.unit}</span>
                  </>
                ) : null}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
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
                  {metric.value}{' '}
                  {metric.unit ? (
                    <span className="text-base font-medium text-muted-foreground">
                      {metric.unit}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
