import { Ban, CircleDot, CircleDashed, CircleCheck } from 'lucide-react';

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
  null: {
    label: 'Null',
    icon: Ban,
    className: 'bg-destructive/10 text-destructive',
  },
};

function resolveStatusCopy(status: string | null | undefined) {
  const key = status?.trim().toLowerCase();

  if (key === 'open' || key === 'partial' || key === 'settled' || key === 'null') {
    return STATUS_COPY[key];
  }

  if (status == null || status.trim() === '') {
    return STATUS_COPY.null;
  }

  return {
    label: status,
    icon: CircleDashed,
    className: 'bg-muted text-foreground',
  };
}

export function SaleStatusBadge({ status }: { status: SaleStatus | string | null | undefined }) {
  const { label, icon: Icon, className } = resolveStatusCopy(status);

  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
