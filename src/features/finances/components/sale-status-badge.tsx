import { CircleDot, CircleDashed, CircleCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { SaleStatus } from '../types';

const STATUS_COPY: Record<
  SaleStatus,
  { label: string; icon: typeof CircleDot; className: string }
> = {
  open: {
    label: 'Open',
    icon: CircleDot,
    className: 'bg-secondary text-secondary-foreground',
  },
  partial: {
    label: 'Partial',
    icon: CircleDashed,
    className: 'bg-muted text-foreground',
  },
  settled: {
    label: 'Settled',
    icon: CircleCheck,
    className: 'bg-primary/10 text-primary',
  },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { label, icon: Icon, className } = STATUS_COPY[status];

  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
