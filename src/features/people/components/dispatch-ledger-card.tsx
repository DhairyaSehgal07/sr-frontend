import { BookOpen, CalendarClock, MapPin, Phone } from 'lucide-react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { DispatchLedger } from '../types';

type DispatchLedgerCardProps = {
  ledger: DispatchLedger;
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatCreatedAt(createdAt?: string) {
  if (!createdAt) return 'Date not available';

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Date not available';

  return `Added ${dateFormatter.format(date)}`;
}

export function DispatchLedgerCard({ ledger }: DispatchLedgerCardProps) {
  return (
    <Card size="sm" className={cn('card-hover gap-0')}>
      <CardHeader className="pb-2">
        <CardTitle className="truncate" title={ledger.name}>
          {ledger.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 transition-colors duration-200 group-hover/card:text-foreground/80">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden />
          <span>{formatCreatedAt(ledger.createdAt)}</span>
        </CardDescription>
        <CardAction>
          <DispatchLedgerIcon />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        {ledger.mobileNumber ? (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="tabular-nums">{ledger.mobileNumber}</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-3.5 shrink-0" aria-hidden />
            Mobile number not available
          </p>
        )}

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="line-clamp-2" title={ledger.address}>
            {ledger.address}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

function DispatchLedgerIcon() {
  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center rounded-xl bg-primary/10',
        'transition-colors duration-200 group-hover/card:bg-primary/15',
      )}
    >
      <BookOpen
        className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
        aria-hidden
      />
    </div>
  );
}

export function DispatchLedgerCardSkeleton() {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}
