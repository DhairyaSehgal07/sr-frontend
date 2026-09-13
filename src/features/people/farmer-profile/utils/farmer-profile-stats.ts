import { ArrowDownToLine, Inbox, Package, Sprout, type LucideIcon } from 'lucide-react';

import type { FarmerStorageLinkGatePassesResult } from '@/features/people/api/gate-pass-types';

export type FarmerProfileStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
};

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatFarmerProfileBagCount(value: number) {
  return bagFormatter.format(value);
}

function getUngradedBags(gatePasses?: FarmerStorageLinkGatePassesResult) {
  if (!gatePasses) return 0;

  return gatePasses.incoming.reduce<number>((total, item) => {
    if (item.status === 'GRADED') return total;
    return total + item.bagsReceived;
  }, 0);
}

export function buildFarmerProfileStats(
  gatePasses?: FarmerStorageLinkGatePassesResult,
): FarmerProfileStat[] {
  return [
    {
      label: 'Incoming',
      value: gatePasses?.totalIncomingBags ?? 0,
      icon: ArrowDownToLine,
      iconClassName: 'bg-chart-2/15 text-chart-2',
    },
    {
      label: 'Ungraded',
      value: getUngradedBags(gatePasses),
      icon: Inbox,
      iconClassName: 'bg-chart-4/15 text-chart-4',
    },
    {
      label: 'Grading',
      value: gatePasses?.totalGradingBags ?? 0,
      icon: Sprout,
      iconClassName: 'bg-chart-3/15 text-chart-3',
    },
    {
      label: 'Storage',
      value: gatePasses?.totalStorageBags ?? 0,
      icon: Package,
      iconClassName: 'bg-primary/10 text-primary',
    },
  ];
}
