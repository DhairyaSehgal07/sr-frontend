import { Receipt } from 'lucide-react';

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
import { RecordCard, RecordField, RecordList } from './record';

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
      <RecordList>
        {sales.map((sale) => (
          <RecordCard key={sale._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{formatIsoDate(sale.date)}</p>
                <p className="font-mono text-base font-medium text-foreground tabular-nums">
                  GP {sale.gatePassNo}
                </p>
              </div>
              <SaleStatusBadge status={sale.status} />
            </div>
            <p className="text-right text-base font-medium text-foreground tabular-nums">
              {money(sale.amountPaise)}
            </p>
            <RecordField label="Bill book">{sale.billBookName}</RecordField>
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
            <RecordField label="Recovered">
              <span className="font-medium tabular-nums">{money(sale.recoveredPaise)}</span>
            </RecordField>
            <RecordField label="Outstanding">
              <span className="font-medium tabular-nums">{money(sale.outstandingPaise)}</span>
            </RecordField>
          </RecordCard>
        ))}
      </RecordList>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <Table className="min-w-[60rem]">
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
