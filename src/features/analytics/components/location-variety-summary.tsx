import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

import type { LocationWiseVarietySummaryItem } from '../types/location-wise-storage';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function formatBags(value: number) {
  return bagFormatter.format(value);
}

export function VarietySummaryBadges({
  items,
  varietyColorMap,
  className,
}: {
  items: LocationWiseVarietySummaryItem[];
  varietyColorMap: Map<string, string>;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <li key={item.variety}>
          <Badge
            variant="outline"
            className="h-auto max-w-full gap-1.5 rounded-full border-border/80 bg-background/80 px-2.5 py-1 text-sm font-normal whitespace-normal shadow-none"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: varietyColorMap.get(item.variety) ?? 'var(--chart-1)',
              }}
              aria-hidden
            />
            <span className="max-w-[8rem] truncate sm:max-w-[10rem]">{item.variety}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatBags(item.currentQuantity)}
            </span>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function LocationSectionStatsLine({
  bagCount,
  parts,
  includeBags = true,
  className,
}: {
  bagCount: number;
  parts: string[];
  includeBags?: boolean;
  className?: string;
}) {
  const segments: string[] = [];

  if (includeBags) {
    segments.push(`${formatBags(bagCount)} bags`);
  }

  segments.push(...parts);

  if (segments.length === 0) return null;

  return (
    <ItemDescription className={cn('line-clamp-none', className)}>
      {segments.map((segment, index) => (
        <span key={segment}>
          {index > 0 ? ' · ' : null}
          {includeBags && index === 0 ? (
            <span className="font-medium tabular-nums text-foreground">{segment}</span>
          ) : (
            segment
          )}
        </span>
      ))}
    </ItemDescription>
  );
}

export function LocationSectionTrigger({
  icon: Icon,
  iconWrapClassName,
  title,
  statsLine,
  varietySummary,
  varietyColorMap,
  layout = 'stacked',
}: {
  icon: LucideIcon;
  iconWrapClassName: string;
  title: string;
  statsLine: ReactNode;
  varietySummary: LocationWiseVarietySummaryItem[];
  varietyColorMap: Map<string, string>;
  layout?: 'stacked' | 'inline';
}) {
  const badges = (
    <VarietySummaryBadges
      items={varietySummary}
      varietyColorMap={varietyColorMap}
      className={layout === 'inline' ? 'min-w-0 flex-1' : undefined}
    />
  );

  const iconMedia = (
    <ItemMedia variant="icon" className={cn('size-9 rounded-lg [&_svg]:size-4', iconWrapClassName)}>
      <Icon aria-hidden />
    </ItemMedia>
  );

  if (layout === 'inline') {
    return (
      <Item
        variant="default"
        size="sm"
        className="min-w-0 flex-1 flex-col items-stretch gap-3 border-0 p-0"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex min-w-0 items-center gap-3 lg:max-w-[12rem] lg:shrink-0 xl:max-w-[14rem]">
            {iconMedia}
            <ItemContent className="min-w-0">
              <ItemTitle className="font-heading text-sm font-semibold sm:text-base">
                {title}
              </ItemTitle>
              {statsLine}
            </ItemContent>
          </div>
          {badges}
        </div>
      </Item>
    );
  }

  return (
    <Item
      variant="default"
      size="sm"
      className="min-w-0 flex-1 flex-col items-stretch gap-3 border-0 p-0"
    >
      <div className="flex items-center gap-3">
        {iconMedia}
        <ItemContent className="min-w-0">
          <ItemTitle className="font-heading text-sm font-semibold sm:text-base">{title}</ItemTitle>
        </ItemContent>
      </div>
      {statsLine}
      {badges}
    </Item>
  );
}

export function LocationSectionTotal({
  current,
  className,
}: {
  current: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'shrink-0 rounded-lg bg-muted/50 px-2.5 py-1 text-right tabular-nums',
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground sm:text-base">{formatBags(current)}</p>
      <p className="text-xs text-muted-foreground">bags</p>
    </div>
  );
}
