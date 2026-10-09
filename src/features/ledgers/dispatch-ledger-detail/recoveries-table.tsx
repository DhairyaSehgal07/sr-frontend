import { Banknote } from 'lucide-react';
import { useMemo } from 'react';

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
import type {
  FinanceRecovery,
  FinanceRecoveryAllocation,
  FinanceSale,
} from '@/features/finances/api/types';
import { formatInr, formatIsoDate, paiseToRupees } from '@/features/finances/lib/format';

import { RecordCard, RecordField, RecordList } from './record';

type RecoveriesTableProps = {
  recoveries: readonly FinanceRecovery[];
  sales: readonly FinanceSale[];
  bookFiltered: boolean;
};

function AllocationLines({
  allocations,
  salesById,
}: {
  allocations: readonly FinanceRecoveryAllocation[];
  salesById: ReadonlyMap<string, FinanceSale>;
}) {
  if (allocations.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {allocations.map((allocation, index) => {
        const sale = salesById.get(allocation.saleId);
        const amount = formatInr(paiseToRupees(allocation.amountPaise));

        return (
          <span key={`${allocation.saleId}-${index}`} className="tabular-nums">
            {sale ? (
              <>
                <span className="font-mono text-foreground">GP {sale.gatePassNo}</span>
                {sale.billNumber != null ? (
                  <span className="text-muted-foreground"> · Bill {sale.billNumber}</span>
                ) : null}
                <span className="text-foreground"> · {amount}</span>
              </>
            ) : (
              <span className="text-foreground">{amount}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function RecoveriesTable({ recoveries, sales, bookFiltered }: RecoveriesTableProps) {
  const salesById = useMemo(() => {
    const map = new Map<string, FinanceSale>();
    for (const sale of sales) map.set(sale._id, sale);
    return map;
  }, [sales]);

  if (recoveries.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Banknote />
          </EmptyMedia>
          <EmptyTitle>
            {bookFiltered ? 'No recoveries in this bill book' : 'No recoveries yet'}
          </EmptyTitle>
          <EmptyDescription>
            {bookFiltered
              ? 'Nothing has been collected against this party in the selected bill book.'
              : 'Payments collected from this party will show which bill they were applied to.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <RecordList>
        {recoveries.map((recovery) => (
          <RecordCard key={recovery._id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{formatIsoDate(recovery.date)}</p>
              <p className="text-base font-medium text-foreground tabular-nums">
                {formatInr(paiseToRupees(recovery.amountPaise))}
              </p>
            </div>
            <RecordField label="Bill book">{recovery.billBookName}</RecordField>
            <RecordField label="Remark">
              {recovery.remark?.trim() ? recovery.remark : '—'}
            </RecordField>
            <div className="flex flex-col gap-1 border-t border-border pt-2.5">
              <p className="text-sm text-muted-foreground">Applied to</p>
              <AllocationLines allocations={recovery.allocations} salesById={salesById} />
            </div>
          </RecordCard>
        ))}
      </RecordList>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <Table className="min-w-[44rem]">
          <TableHeader className="sticky top-0 z-20 bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Bill book
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Remark</TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Applied to
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recoveries.map((recovery) => (
              <TableRow key={recovery._id} className="group/recovery">
                <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 align-top group-hover/recovery:bg-muted/50">
                  {formatIsoDate(recovery.date)}
                </TableCell>
                <TableCell
                  className="max-w-40 min-w-0 truncate px-3 py-2.5 align-top text-foreground"
                  title={recovery.billBookName}
                >
                  {recovery.billBookName}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right align-top text-sm font-medium text-foreground tabular-nums">
                  {formatInr(paiseToRupees(recovery.amountPaise))}
                </TableCell>
                <TableCell
                  className="max-w-56 min-w-0 truncate px-3 py-2.5 align-top text-foreground"
                  title={recovery.remark || undefined}
                >
                  {recovery.remark?.trim() ? recovery.remark : '—'}
                </TableCell>
                <TableCell className="px-3 py-2.5 align-top text-sm">
                  <AllocationLines allocations={recovery.allocations} salesById={salesById} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
