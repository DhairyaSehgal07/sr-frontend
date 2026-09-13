import { useMemo } from 'react';
import { MapPin, Phone } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { FarmerStorageLinkGatePassesResult } from '@/features/people/api/gate-pass-types';
import { cn } from '@/lib/utils';

import {
  buildFarmerProfileStats,
  formatFarmerProfileBagCount,
  type FarmerProfileStat,
} from '../utils/farmer-profile-stats';
import { getFarmerInitials } from '../utils/get-farmer-initials';

type FarmerProfileHeaderProps = {
  name: string;
  mobileNumber: string;
  accountNumber: number;
  address: string;
  gatePasses?: FarmerStorageLinkGatePassesResult;
  isLoadingGatePasses?: boolean;
};

function FarmerProfileStatCard({ label, value, icon: Icon, iconClassName }: FarmerProfileStat) {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <div className={cn('flex size-9 items-center justify-center rounded-xl', iconClassName)}>
            <Icon className="size-4" aria-hidden />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatFarmerProfileBagCount(value)}
          </p>
          <p className="text-xs text-muted-foreground">bags</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FarmerProfileStatCardSkeleton() {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <CardDescription>
          <Skeleton className="h-4 w-20" />
        </CardDescription>
        <CardAction>
          <Skeleton className="size-9 rounded-xl" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-10" />
      </CardContent>
    </Card>
  );
}

export function FarmerProfileHeader({
  name,
  mobileNumber,
  accountNumber,
  address,
  gatePasses,
  isLoadingGatePasses = false,
}: FarmerProfileHeaderProps) {
  const stats = useMemo(() => buildFarmerProfileStats(gatePasses), [gatePasses]);

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="flex items-start gap-3 border-b border-border/60 bg-muted/10 p-4 sm:px-5">
        <Avatar size="lg" className="after:border-primary/15">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getFarmerInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <CardTitle
            className="font-heading line-clamp-2 text-base font-semibold tracking-tight"
            title={name}
          >
            {name}
          </CardTitle>

          <CardDescription className="mt-1 tabular-nums">
            Account #{accountNumber.toLocaleString('en-IN')}
          </CardDescription>

          <div className="mt-3 flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="tabular-nums">{mobileNumber}</span>
            </p>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="line-clamp-2" title={address}>
                {address}
              </span>
            </p>
          </div>
        </div>
      </div>

      <CardContent className="py-4 sm:px-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoadingGatePasses
            ? Array.from({ length: 4 }).map((_, index) => (
                <FarmerProfileStatCardSkeleton key={index} />
              ))
            : stats.map((stat) => <FarmerProfileStatCard key={stat.label} {...stat} />)}
        </div>
      </CardContent>
    </Card>
  );
}
