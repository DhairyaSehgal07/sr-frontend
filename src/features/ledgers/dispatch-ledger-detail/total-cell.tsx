import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function TotalCell({
  label,
  value,
  badge,
}: {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 bg-background px-4 py-3',
        'sm:flex-col sm:items-end sm:gap-1 sm:px-3 sm:py-2.5',
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <span className="truncate">{label}</span>
        {badge}
      </span>
      <span className="shrink-0 text-right text-sm font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
