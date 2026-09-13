import { Link } from '@tanstack/react-router';
import { MapPin, Phone, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

import type { FarmerStorageLink } from '../types';

type PeopleCardProps = {
  link: FarmerStorageLink;
};

export function PeopleCard({ link }: PeopleCardProps) {
  const farmer = link.farmerId;

  return (
    <Link
      to="/people/$id"
      params={{ id: link._id }}
      search={{
        name: farmer.name,
        mobileNumber: farmer.mobileNumber,
        accountNumber: link.accountNumber,
        address: farmer.address,
        tab: 'incoming',
      }}
      className="block min-w-0 rounded-4xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <Card size="sm" className={cn('card-hover gap-0')}>
        <CardHeader className="pb-2">
          <CardTitle className="truncate" title={farmer.name}>
            {farmer.name}
          </CardTitle>
          <CardDescription className="tabular-nums transition-colors duration-200 group-hover/card:text-foreground/80">
            Account #{link.accountNumber}
          </CardDescription>
          <CardAction>
            <PeopleAvatarIcon />
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="tabular-nums">{farmer.mobileNumber}</span>
          </p>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="line-clamp-2" title={farmer.address}>
              {farmer.address}
            </span>
          </p>

          <Badge
            variant="outline"
            className={cn(
              'w-fit font-normal',
              link.isActive
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'bg-muted/50 text-muted-foreground',
            )}
          >
            {link.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function PeopleAvatarIcon() {
  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center rounded-xl bg-primary/10',
        'transition-colors duration-200 group-hover/card:bg-primary/15',
      )}
    >
      <User
        className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
        aria-hidden
      />
    </div>
  );
}

export function PeopleCardSkeleton() {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardContent>
    </Card>
  );
}
