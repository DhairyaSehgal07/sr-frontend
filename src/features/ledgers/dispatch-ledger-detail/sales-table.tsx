import { Receipt } from 'lucide-react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FinanceSale } from '@/features/finances/api/types';
import { SaleStatusBadge } from '@/features/finances/components/sale-status-badge';
import {
  formatBags,
  formatInr,
  formatIsoDate,
  paiseToRupees,
} from '@/features/finances/lib/format';

import { formatWeight } from './lib';
import { RecordField } from './record';

type SalesTableProps = {
  sales: readonly FinanceSale[];
  bookFiltered: boolean;
};

function money(paise: number) {
  return formatInr(paiseToRupees(paise));
}

export function SalesTable({ sales, bookFiltered }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>{bookFiltered ? 'No bills in this bill book' : 'No bills yet'}</EmptyTitle>
          <EmptyDescription>
            {bookFiltered
              ? 'No sale has been posted for this party in the selected bill book.'
              : 'A bill is posted when a dispatch gate pass is booked.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {sales.map((sale) => (
          <Card key={sale._id} size="sm">
            <CardHeader>
              <CardTitle className="font-mono tabular-nums">GP {sale.gatePassNo}</CardTitle>
              <CardDescription className="truncate" title={sale.billBookName}>
                {formatIsoDate(sale.date)} · {sale.billBookName}
              </CardDescription>
              <CardAction>
                <SaleStatusBadge status={sale.status} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <RecordField label="Amount">
                <span className="font-medium tabular-nums">{money(sale.amountPaise)}</span>
              </RecordField>
              <RecordField label="Recovered">
                <span className="font-medium tabular-nums">{money(sale.recoveredPaise)}</span>
              </RecordField>
              <RecordField label="Outstanding">
                <span className="font-medium tabular-nums">{money(sale.outstandingPaise)}</span>
              </RecordField>
              <RecordField label="Bill no">
                <span className="font-mono tabular-nums">
                  {sale.billNumber != null ? sale.billNumber : '—'}
                </span>
              </RecordField>
              <RecordField label="Bags">
                <span className="tabular-nums">
                  {formatBags(sale.bags)} <span className="text-muted-foreground">bags</span>
                </span>
              </RecordField>
              <RecordField label="Net weight">
                {sale.netWeight != null ? (
                  <span className="tabular-nums">
                    {formatWeight(sale.netWeight)} <span className="text-muted-foreground">kg</span>
                  </span>
                ) : (
                  '—'
                )}
              </RecordField>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden min-w-0 overflow-hidden rounded-lg border border-border md:block">
        <Table className="w-max min-w-full">
          <TableHeader className="sticky top-0 z-20 bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Gate pass
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Bill book
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Bill no
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Bags
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Net weight
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Recovered
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Outstanding
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale._id} className="group/sale">
                <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 group-hover/sale:bg-muted/50">
                  {formatIsoDate(sale.date)}
                </TableCell>
                <TableCell className="px-3 py-2.5 font-mono text-sm text-foreground tabular-nums">
                  {sale.gatePassNo}
                </TableCell>
                <TableCell
                  className="max-w-40 min-w-0 truncate px-3 py-2.5 text-foreground"
                  title={sale.billBookName}
                >
                  {sale.billBookName}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right font-mono text-sm text-foreground tabular-nums">
                  {sale.billNumber != null ? sale.billNumber : '—'}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums">
                  {formatBags(sale.bags)} <span className="text-muted-foreground">bags</span>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums">
                  {sale.netWeight != null ? (
                    <>
                      {formatWeight(sale.netWeight)}{' '}
                      <span className="text-muted-foreground">kg</span>
                    </>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(sale.amountPaise)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(sale.recoveredPaise)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(sale.outstandingPaise)}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <SaleStatusBadge status={sale.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
