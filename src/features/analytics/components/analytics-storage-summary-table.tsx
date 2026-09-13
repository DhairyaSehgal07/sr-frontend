import { useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, Package, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type { StorageVarietySummary } from '../api/get-storage-summary';
import { orderGradingSizeNames } from '../lib/grading-size-order';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type StorageQuantityMode = 'current' | 'initial' | 'outgoing';

type QuantityFields = {
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
};

function getQuantity(item: QuantityFields, mode: StorageQuantityMode): number {
  if (mode === 'current') return item.currentQuantity;
  if (mode === 'initial') return item.initialQuantity;
  return item.quantityRemoved;
}

type StorageTableRow = {
  variety: string;
  values: Record<string, number>;
  total: number;
};

function buildStorageSummaryTable(data: StorageVarietySummary[], mode: StorageQuantityMode) {
  const sizeNames = orderGradingSizeNames(
    data.flatMap((variety) => variety.sizes.map((size) => size.size)),
  );

  const rows: StorageTableRow[] = data.map((variety) => {
    const bySize = new Map(variety.sizes.map((size) => [size.size, getQuantity(size, mode)]));
    const values: Record<string, number> = {};
    for (const sizeName of sizeNames) {
      values[sizeName] = Number(bySize.get(sizeName) ?? 0);
    }
    return {
      variety: variety.variety,
      values,
      total: getQuantity(variety, mode),
    };
  });

  const totals: Record<string, number> = {};
  for (const sizeName of sizeNames) {
    totals[sizeName] = rows.reduce((sum, row) => sum + Number(row.values[sizeName] ?? 0), 0);
  }
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return { sizeNames, rows, totals, grandTotal };
}

function sumModeTotal(data: StorageVarietySummary[], mode: StorageQuantityMode): number {
  return data.reduce((sum, variety) => sum + getQuantity(variety, mode), 0);
}

export function AnalyticsStorageSummaryTable({
  query,
}: {
  query: UseQueryResult<StorageVarietySummary[], Error>;
}) {
  const [quantityMode, setQuantityMode] = useState<StorageQuantityMode>('current');

  const { data, error, isError, isLoading, isFetching, refetch } = query;

  const modeTotals = useMemo(
    () =>
      data
        ? {
            current: sumModeTotal(data, 'current'),
            initial: sumModeTotal(data, 'initial'),
            outgoing: sumModeTotal(data, 'outgoing'),
          }
        : { current: 0, initial: 0, outgoing: 0 },
    [data],
  );

  const { sizeNames, rows, totals, grandTotal } = useMemo(
    () => buildStorageSummaryTable(data ?? [], quantityMode),
    [data, quantityMode],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError && data === undefined) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Storage summary could not be loaded
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn('mr-2 size-4', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasData = rows.length > 0;

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4">
        <div className="space-y-1">
          <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold sm:text-lg">
            <Package className="size-5 text-primary" aria-hidden />
            Stock summary
          </CardTitle>
          <CardDescription>
            View stock by current inventory, initial quantities, or outgoing quantities.
          </CardDescription>
        </div>

        <Tabs
          value={quantityMode}
          onValueChange={(value) => setQuantityMode(value as StorageQuantityMode)}
        >
          <TabsList
            aria-label="Stock quantity view"
            className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0"
          >
            <TabsTrigger
              value="current"
              className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Current{' '}
              <span className="tabular-nums">({bagFormatter.format(modeTotals.current)})</span>
            </TabsTrigger>
            <TabsTrigger
              value="initial"
              className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Initial{' '}
              <span className="tabular-nums">({bagFormatter.format(modeTotals.initial)})</span>
            </TabsTrigger>
            <TabsTrigger
              value="outgoing"
              className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Outgoing{' '}
              <span className="tabular-nums">({bagFormatter.format(modeTotals.outgoing)})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            No storage data for the selected date range.
          </p>
        ) : sizeNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">No size breakdown available.</p>
        ) : (
          <div className="relative w-full overflow-auto rounded-lg border border-border">
            <Table className={TABLE_GRID_CLASS}>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="h-10 px-3 font-medium whitespace-nowrap text-muted-foreground">
                    Varieties
                  </TableHead>
                  {sizeNames.map((sizeName) => (
                    <TableHead
                      key={sizeName}
                      className="h-10 px-3 text-right font-medium whitespace-nowrap text-muted-foreground"
                      title={sizeName}
                    >
                      <span className="block max-w-40 truncate sm:max-w-none">{sizeName}</span>
                    </TableHead>
                  ))}
                  <TableHead className="h-10 px-3 text-right font-medium whitespace-nowrap text-muted-foreground">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.variety} className="transition-colors hover:bg-muted/50">
                    <TableCell className="max-w-48 px-3 py-2.5 font-medium whitespace-nowrap text-foreground">
                      <span className="block truncate" title={row.variety}>
                        {row.variety || '—'}
                      </span>
                    </TableCell>
                    {sizeNames.map((sizeName) => (
                      <TableCell
                        key={`${row.variety}-${sizeName}`}
                        className="px-3 py-2.5 text-right tabular-nums text-foreground"
                      >
                        {bagFormatter.format(Number(row.values[sizeName] ?? 0))}
                      </TableCell>
                    ))}
                    <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                      {bagFormatter.format(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell className="px-3 py-2.5 font-medium text-foreground">
                    Bag total
                  </TableCell>
                  {sizeNames.map((sizeName) => (
                    <TableCell
                      key={`total-${sizeName}`}
                      className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary"
                    >
                      {bagFormatter.format(totals[sizeName] ?? 0)}
                    </TableCell>
                  ))}
                  <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                    {bagFormatter.format(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
