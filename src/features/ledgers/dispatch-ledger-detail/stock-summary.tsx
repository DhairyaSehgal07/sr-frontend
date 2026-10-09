import { Package } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBags } from '@/features/finances/lib/format';
import { cn } from '@/lib/utils';

import type { PartyGatePass } from '../api/types';
import { stockMatrixFromPasses } from './lib';

type StockSummaryProps = {
  passes: readonly PartyGatePass[];
  bookFiltered: boolean;
};

function Count({ value, emphasize = false }: { value: number; emphasize?: boolean }) {
  return (
    <span
      className={cn(
        'tabular-nums',
        value === 0 && 'text-muted-foreground',
        value > 0 && !emphasize && 'font-medium text-foreground',
        emphasize && value > 0 && 'font-semibold text-primary',
      )}
    >
      {formatBags(value)}
    </span>
  );
}

export function StockSummary({ passes, bookFiltered }: StockSummaryProps) {
  const matrix = stockMatrixFromPasses(passes);

  if (matrix.rows.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>
            {bookFiltered ? 'No stock in this bill book' : 'No stock dispatched yet'}
          </EmptyTitle>
          <EmptyDescription>
            {bookFiltered
              ? 'Gate passes in this bill book do not list a variety or bag size.'
              : 'Variety and bag size totals appear once a gate pass records what left the store.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border">
      <Table className="w-max min-w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-30 h-10 min-w-28 border-r border-border bg-muted px-3 text-left font-medium text-muted-foreground">
              Varieties
            </TableHead>
            {matrix.sizes.map((size) => (
              <TableHead
                key={size}
                className="h-10 min-w-[4.5rem] bg-muted px-2 text-center font-medium whitespace-nowrap text-muted-foreground"
              >
                {size}
              </TableHead>
            ))}
            <TableHead className="h-10 min-w-[4.5rem] border-l border-border bg-muted px-2 text-center font-medium text-muted-foreground">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.rows.map((row) => (
            <TableRow key={row.variety} className="group/stock">
              <TableCell
                className="sticky left-0 z-10 min-w-28 border-r border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground group-hover/stock:bg-muted"
                title={row.variety}
              >
                <span className="block max-w-36 truncate">{row.variety}</span>
              </TableCell>
              {row.quantities.map((quantity, index) => (
                <TableCell
                  key={matrix.sizes[index]}
                  className="px-2 py-2.5 text-center text-sm whitespace-nowrap"
                >
                  <Count value={quantity} />
                </TableCell>
              ))}
              <TableCell className="border-l border-border px-2 py-2.5 text-center text-sm whitespace-nowrap">
                <Count value={row.total} emphasize />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell className="sticky left-0 z-10 min-w-28 border-r border-border bg-muted px-3 py-2.5 text-sm font-medium whitespace-nowrap text-foreground">
              Bag Total
            </TableCell>
            {matrix.columnTotals.map((total, index) => (
              <TableCell
                key={matrix.sizes[index]}
                className="bg-muted px-2 py-2.5 text-center text-sm whitespace-nowrap"
              >
                <Count value={total} />
              </TableCell>
            ))}
            <TableCell className="border-l border-border bg-muted px-2 py-2.5 text-center text-sm whitespace-nowrap">
              <Count value={matrix.grandTotal} emphasize />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
