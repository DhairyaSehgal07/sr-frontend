import { useMemo, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronRight,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  Rows3,
  type LucideIcon,
} from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { GetStorageGatePassReportResponse } from '@/features/storage-report/api/types';
import type { StorageGatePass } from '@/features/storage/api/types';
import { cn } from '@/lib/utils';

import { buildVarietyColorMap, collectVarietiesFromTree } from '../lib/location-variety-colors';
import { buildLocationWiseStorageTree } from '../lib/location-wise-storage-utils';
import type {
  LocationWiseChamberNode,
  LocationWiseFarmerEntry,
  LocationWiseFloorNode,
  LocationWiseRowNode,
  LocationWiseStorageTree,
  LocationWiseVarietyNode,
  LocationWiseVarietySummaryItem,
} from '../types/location-wise-storage';

import {
  LocationSectionStatsLine,
  LocationSectionTotal,
  LocationSectionTrigger,
} from './location-variety-summary';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function formatBags(value: number) {
  return bagFormatter.format(value);
}

function formatQuantityPair(current: number, initial: number) {
  return `${formatBags(current)} / ${formatBags(initial)}`;
}

type LocationLevel = 'chamber' | 'floor' | 'row' | 'variety';

const levelStyles: Record<
  LocationLevel,
  {
    list: string;
    item: string;
    trigger: string;
    content: string;
    iconWrap: string;
    layout: 'stacked' | 'inline';
  }
> = {
  chamber: {
    list: 'flex flex-col gap-3',
    item: 'overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-foreground/5',
    trigger: 'px-4 py-4 hover:bg-muted/30 data-[state=open]:bg-muted/20 sm:px-5',
    content: 'border-t border-border/60 bg-muted/10 px-3 py-4 sm:px-4',
    iconWrap: 'bg-primary/10 text-primary',
    layout: 'stacked',
  },
  floor: {
    list: 'flex flex-col gap-2 border-l-2 border-primary/15 pl-3 sm:pl-4',
    item: 'overflow-hidden rounded-xl border border-border/70 bg-background',
    trigger: 'px-3 py-3.5 hover:bg-muted/30 sm:px-4',
    content: 'border-t border-border/60 bg-muted/15 px-3 pb-3 pt-0 sm:px-4',
    iconWrap: 'bg-muted/80 text-foreground',
    layout: 'inline',
  },
  row: {
    list: 'flex flex-col gap-2 border-l border-border pl-3',
    item: 'overflow-hidden rounded-lg border border-border/60 bg-background',
    trigger: 'px-3 py-3 hover:bg-muted/25',
    content: 'border-t border-border/50 bg-muted/10 px-3 pb-3',
    iconWrap: 'bg-muted text-muted-foreground',
    layout: 'stacked',
  },
  variety: {
    list: 'flex flex-col gap-2',
    item: 'overflow-hidden rounded-lg border border-border/50 bg-background',
    trigger: 'px-3 py-3 hover:bg-muted/20',
    content: 'border-t border-border/50 bg-background p-3',
    iconWrap: 'bg-primary/10 text-primary',
    layout: 'stacked',
  },
};

function LocationCollapsibleSection({
  level,
  title,
  statsParts,
  varietySummary,
  varietyColorMap,
  current,
  icon,
  includeBagsInStatsLine = false,
  children,
}: {
  level: LocationLevel;
  title: string;
  statsParts: string[];
  varietySummary: LocationWiseVarietySummaryItem[];
  varietyColorMap: Map<string, string>;
  current: number;
  icon: LucideIcon;
  includeBagsInStatsLine?: boolean;
  children: ReactNode;
}) {
  const styles = levelStyles[level];

  return (
    <Collapsible className={cn('group', styles.item)}>
      <CollapsibleTrigger
        className={cn(
          styles.trigger,
          'flex w-full cursor-pointer items-start gap-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30',
        )}
      >
        <LocationSectionTrigger
          icon={icon}
          iconWrapClassName={styles.iconWrap}
          title={title}
          statsLine={
            <LocationSectionStatsLine
              bagCount={current}
              parts={statsParts}
              includeBags={includeBagsInStatsLine}
            />
          }
          varietySummary={varietySummary}
          varietyColorMap={varietyColorMap}
          layout={styles.layout}
        />
        <div className="flex shrink-0 items-start gap-3 pt-0.5">
          <LocationSectionTotal current={current} />
          <ChevronRight
            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(styles.content, 'overflow-visible')}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FarmerEntriesTable({ entries }: { entries: LocationWiseFarmerEntry[] }) {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Farmer</TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Account no.
            </TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">
              Bag size &amp; type
            </TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Current / initial
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={`${entry.gatePassId}-${entry.bagSize}-${entry.bagType}-${index}`}
              className="border-b border-border transition-colors even:bg-muted/25 hover:bg-muted/40"
            >
              <TableCell className="px-3 py-2.5">
                <span
                  className="block max-w-56 truncate text-sm font-medium text-foreground sm:max-w-xs"
                  title={entry.farmerName}
                >
                  {entry.farmerName}
                </span>
                <span className="text-xs text-muted-foreground">Gate pass #{entry.gatePassNo}</span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm tabular-nums text-foreground">
                {entry.farmerAccountNumber}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-sm text-foreground">
                <span className="font-medium">{entry.bagSize}</span>
                <span className="text-muted-foreground"> · {entry.bagType}</span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-foreground">
                {formatQuantityPair(entry.currentQuantity, entry.initialQuantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function VarietyList({
  varieties,
  varietyColorMap,
}: {
  varieties: LocationWiseVarietyNode[];
  varietyColorMap: Map<string, string>;
}) {
  if (varieties.length === 0) return null;

  return (
    <div className={levelStyles.variety.list}>
      {varieties.map((varietyNode) => (
        <LocationCollapsibleSection
          key={varietyNode.variety}
          level="variety"
          icon={Package}
          title={varietyNode.variety}
          statsParts={[
            `${varietyNode.entries.length} gate pass line${varietyNode.entries.length === 1 ? '' : 's'}`,
          ]}
          includeBagsInStatsLine
          varietySummary={[
            {
              variety: varietyNode.variety,
              currentQuantity: varietyNode.totalCurrentQuantity,
              initialQuantity: varietyNode.totalInitialQuantity,
            },
          ]}
          varietyColorMap={varietyColorMap}
          current={varietyNode.totalCurrentQuantity}
        >
          <FarmerEntriesTable entries={varietyNode.entries} />
        </LocationCollapsibleSection>
      ))}
    </div>
  );
}

function RowList({
  rows,
  varietyColorMap,
}: {
  rows: LocationWiseRowNode[];
  varietyColorMap: Map<string, string>;
}) {
  if (rows.length === 0) return null;

  return (
    <div className={levelStyles.row.list}>
      {rows.map((rowNode) => (
        <LocationCollapsibleSection
          key={rowNode.row}
          level="row"
          icon={Rows3}
          title={`Row ${rowNode.row}`}
          statsParts={[`${rowNode.varietyCount} variet${rowNode.varietyCount === 1 ? 'y' : 'ies'}`]}
          varietySummary={rowNode.varietySummary}
          varietyColorMap={varietyColorMap}
          current={rowNode.totalCurrentQuantity}
        >
          <VarietyList varieties={rowNode.varieties} varietyColorMap={varietyColorMap} />
        </LocationCollapsibleSection>
      ))}
    </div>
  );
}

function FloorList({
  floors,
  varietyColorMap,
}: {
  floors: LocationWiseFloorNode[];
  varietyColorMap: Map<string, string>;
}) {
  if (floors.length === 0) return null;

  return (
    <div className={levelStyles.floor.list}>
      {floors.map((floorNode) => (
        <LocationCollapsibleSection
          key={floorNode.floor}
          level="floor"
          icon={Layers}
          title={`Floor ${floorNode.floor}`}
          statsParts={[
            `${floorNode.rows.length} row${floorNode.rows.length === 1 ? '' : 's'}`,
            `${floorNode.varietyCount} variet${floorNode.varietyCount === 1 ? 'y' : 'ies'}`,
          ]}
          varietySummary={floorNode.varietySummary}
          varietyColorMap={varietyColorMap}
          current={floorNode.totalCurrentQuantity}
        >
          <RowList rows={floorNode.rows} varietyColorMap={varietyColorMap} />
        </LocationCollapsibleSection>
      ))}
    </div>
  );
}

function ChamberList({
  chambers,
  varietyColorMap,
}: {
  chambers: LocationWiseChamberNode[];
  varietyColorMap: Map<string, string>;
}) {
  if (chambers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted" aria-hidden>
          <MapPin className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No location data</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Gate passes in this date range do not have chamber, floor, or row assignments yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={levelStyles.chamber.list}>
      {chambers.map((chamberNode) => (
        <LocationCollapsibleSection
          key={`chamber-${chamberNode.chamber}`}
          level="chamber"
          icon={MapPin}
          title={`Chamber ${chamberNode.chamber}`}
          statsParts={[
            `${chamberNode.floors.length} floor${chamberNode.floors.length === 1 ? '' : 's'}`,
            `${chamberNode.varietyCount} variet${chamberNode.varietyCount === 1 ? 'y' : 'ies'}`,
          ]}
          varietySummary={chamberNode.varietySummary}
          varietyColorMap={varietyColorMap}
          current={chamberNode.totalCurrentQuantity}
          includeBagsInStatsLine
        >
          <FloorList floors={chamberNode.floors} varietyColorMap={varietyColorMap} />
        </LocationCollapsibleSection>
      ))}
    </div>
  );
}

function LocationWiseStorageSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-18 w-full rounded-2xl" />
        <Skeleton className="h-18 w-full rounded-2xl" />
        <Skeleton className="h-18 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}

function LocationWiseStorageError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Could not load location-wise storage
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={cn('mr-2 size-4', isRetrying && 'animate-spin')} aria-hidden />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function LocationWiseStorageAnalytics({ tree }: { tree: LocationWiseStorageTree }) {
  const varietyColorMap = useMemo(() => {
    const varieties = collectVarietiesFromTree(tree);
    return buildVarietyColorMap(varieties);
  }, [tree]);

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4">
        <div className="space-y-1">
          <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold sm:text-lg">
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
            Location-wise storage
          </CardTitle>
          <CardDescription className="leading-relaxed">
            Expand a chamber to drill down by floor, row, and variety. Each level shows a
            variety-wise bag summary.
          </CardDescription>
        </div>
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Chambers</dt>
            <dd className="font-medium tabular-nums text-foreground">{tree.chambers.length}</dd>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Bags in storage</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {formatBags(tree.totalCurrentQuantity)}
            </dd>
          </div>
        </dl>
      </CardHeader>
      <CardContent>
        <ChamberList chambers={tree.chambers} varietyColorMap={varietyColorMap} />
      </CardContent>
    </Card>
  );
}

export function LocationWiseStorageAnalyticsFromPasses({
  storageGatePasses,
}: {
  storageGatePasses: StorageGatePass[];
}) {
  const tree = useMemo(() => buildLocationWiseStorageTree(storageGatePasses), [storageGatePasses]);

  return <LocationWiseStorageAnalytics tree={tree} />;
}

export function LocationWiseStorageAnalyticsCard({
  query,
}: {
  query: UseQueryResult<GetStorageGatePassReportResponse, Error>;
}) {
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  if (isLoading) {
    return <LocationWiseStorageSkeleton />;
  }

  if (isError && data === undefined) {
    return (
      <LocationWiseStorageError
        message={error instanceof Error ? error.message : 'Failed to load storage gate pass report'}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const passes = data?.data.storageGatePasses ?? [];

  return <LocationWiseStorageAnalyticsFromPasses storageGatePasses={passes} />;
}
