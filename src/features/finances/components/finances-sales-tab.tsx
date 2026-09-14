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

import { formatBags, formatInr, formatIsoDate } from '../lib/format';
import type { SaleRow } from '../types';
import { SaleStatusBadge } from './sale-status-badge';

export function FinancesSalesTab({ rows }: { rows: SaleRow[] }) {
  if (rows.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>No sales in this bill book</EmptyTitle>
          <EmptyDescription>
            Sale entries are created automatically from dispatch vouchers. Try another bill book.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-20 bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Voucher</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Bill book</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Party</TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Bags
            </TableHead>
            <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Journal</TableHead>
            <TableHead className="h-10 px-3 font-medium text-muted-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="group/sale">
              <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 group-hover/sale:bg-muted/50">
                {formatIsoDate(row.date)}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span
                    className="font-mono text-sm text-foreground tabular-nums"
                    title={`Gate pass ${row.gatePassNo}`}
                  >
                    GP {row.gatePassNo}
                  </span>
                  {row.billNumber != null ? (
                    <span className="font-mono text-sm text-muted-foreground tabular-nums">
                      Bill {row.billNumber}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-foreground">{row.billBook}</TableCell>
              <TableCell
                className="max-w-48 min-w-0 truncate px-3 py-2.5 text-foreground"
                title={row.partyName}
              >
                {row.partyName}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right tabular-nums">
                {formatBags(row.bags)} <span className="text-muted-foreground">bags</span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                {formatInr(row.amount)}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <div className="flex min-w-0 flex-col text-sm">
                  <span className="truncate text-foreground" title={`Dr ${row.partyName}`}>
                    Dr {row.partyName}
                  </span>
                  <span className="text-muted-foreground">Cr Sales</span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <SaleStatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
