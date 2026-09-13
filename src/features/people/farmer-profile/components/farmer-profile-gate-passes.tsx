import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import {
  ArrowLeftRight,
  Inbox,
  Loader2,
  PackageCheck,
  RefreshCw,
  Scale,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

import { GatePassCard, GatePassCardSkeleton } from '@/components/incoming-gate-pass-card';
import {
  GradingGatePassCard,
  GradingGatePassCardSkeleton,
} from '@/components/grading-gate-pass-card';
import {
  StorageGatePassCard,
  StorageGatePassCardSkeleton,
} from '@/components/storage-gate-pass-card';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DispatchPreStorageGatePassCard,
  DispatchPreStorageGatePassCardSkeleton,
} from '@/features/dispatch-pre-storage/components/dispatch-pre-storage-gate-pass-card';
import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';
import type { GradingGatePass } from '@/features/grading/api/types';
import type { IncomingGatePass } from '@/features/incoming/api/types';
import type { FarmerStorageLinkGatePassesResult } from '@/features/people/api/gate-pass-types';
import type { StorageGatePass } from '@/features/storage/api/types';
import { preserveScroll } from '@/lib/preserve-scroll';

import type { FarmerProfileGatePassTab } from '../search';
import { GatePassList } from './gate-pass-list';

const farmerProfileRouteApi = getRouteApi('/_authenticated/people/$id');

type FarmerProfileGatePassesProps = {
  query: UseQueryResult<FarmerStorageLinkGatePassesResult, Error>;
};

type GatePassTabConfig = {
  value: FarmerProfileGatePassTab;
  label: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  getItems: (data?: FarmerStorageLinkGatePassesResult) => unknown[];
  skeleton: ReactNode;
  renderItem: (item: unknown) => ReactNode;
};

const GATE_PASS_TABS: readonly GatePassTabConfig[] = [
  {
    value: 'incoming',
    label: 'Incoming',
    icon: Sprout,
    emptyTitle: 'No incoming gate passes',
    emptyDescription: 'Incoming gate passes for this farmer will appear here.',
    getItems: (data) => data?.incoming ?? [],
    skeleton: <GatePassCardSkeleton />,
    renderItem: (item) => <GatePassCard data={item as IncomingGatePass} canUpdate={false} />,
  },
  {
    value: 'grading',
    label: 'Grading',
    icon: Inbox,
    emptyTitle: 'No grading gate passes',
    emptyDescription: 'Grading gate passes for this farmer will appear here.',
    getItems: (data) => data?.grading ?? [],
    skeleton: <GradingGatePassCardSkeleton />,
    renderItem: (item) => <GradingGatePassCard data={item as GradingGatePass} canUpdate={false} />,
  },
  {
    value: 'storage',
    label: 'Storage',
    icon: Scale,
    emptyTitle: 'No storage gate passes',
    emptyDescription: 'Storage gate passes for this farmer will appear here.',
    getItems: (data) => data?.storage ?? [],
    skeleton: <StorageGatePassCardSkeleton />,
    renderItem: (item) => <StorageGatePassCard data={item as StorageGatePass} canUpdate={false} />,
  },
  {
    value: 'dispatch',
    label: 'Dispatch',
    icon: PackageCheck,
    emptyTitle: 'No dispatch gate passes',
    emptyDescription: 'Nikasi gate passes for this farmer will appear here.',
    getItems: (data) => data?.nikasi ?? [],
    skeleton: <DispatchPreStorageGatePassCardSkeleton />,
    renderItem: (item) => <DispatchPreStorageGatePassCard data={item as NikasiGatePass} />,
  },
  {
    value: 'booking',
    label: 'Booking',
    icon: ArrowLeftRight,
    emptyTitle: 'No booking gate passes',
    emptyDescription: 'Booking gate passes for this farmer will appear here.',
    getItems: (data) => data?.outgoing ?? [],
    skeleton: <GatePassCardSkeleton />,
    renderItem: () => null,
  },
];

export function FarmerProfileGatePasses({ query }: FarmerProfileGatePassesProps) {
  const { tab } = farmerProfileRouteApi.useSearch();
  const navigate = farmerProfileRouteApi.useNavigate();
  const { data, isLoading, isError, error, isFetching, refetch } = query;

  const handleTabChange = (value: string) => {
    navigate({
      search: (previous) => ({
        ...previous,
        tab: value as FarmerProfileGatePassTab,
      }),
      ...preserveScroll,
    });
  };

  if (isLoading) {
    return (
      <Tabs value={tab} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          {GATE_PASS_TABS.map((config) => (
            <TabsTrigger key={config.value} value={config.value} disabled>
              <config.icon className="size-5 sm:hidden" />
              <span className="hidden sm:block">{config.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="space-y-6">
          {GATE_PASS_TABS.find((config) => config.value === tab)?.skeleton}
        </div>
      </Tabs>
    );
  }

  if (isError && data === undefined) {
    return (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sprout />
          </EmptyMedia>
          <EmptyTitle>Could not load gate passes</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error
              ? error.message
              : 'Something went wrong while fetching gate passes.'}
          </EmptyDescription>
        </EmptyHeader>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Try again
        </Button>
      </Empty>
    );
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
      <TabsList className="h-11 w-full">
        {GATE_PASS_TABS.map((config) => (
          <TabsTrigger key={config.value} value={config.value}>
            <config.icon className="size-5 sm:hidden" />
            <span className="hidden sm:block">{config.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {GATE_PASS_TABS.map((config) => (
        <TabsContent key={config.value} value={config.value} className="min-w-0">
          <GatePassList
            items={config.getItems(data)}
            emptyIcon={config.icon}
            emptyTitle={config.emptyTitle}
            emptyDescription={config.emptyDescription}
            renderItem={config.renderItem}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
