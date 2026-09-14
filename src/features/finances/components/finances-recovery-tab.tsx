import { useMemo, useState } from 'react';
import { Banknote, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

import { formatInr, formatIsoDate } from '../lib/format';
import type { PartyOutstanding, RecoveryEntry } from '../types';
import { RecordRecoveryDialog } from './record-recovery-dialog';

type FinancesRecoveryTabProps = {
  outstanding: PartyOutstanding[];
  recoveries: RecoveryEntry[];
  billBookId?: string;
};

export function FinancesRecoveryTab({
  outstanding,
  recoveries,
  billBookId,
}: FinancesRecoveryTabProps) {
  const [recordOpen, setRecordOpen] = useState(false);
  const dueRows = useMemo(() => outstanding.filter((row) => row.due > 0), [outstanding]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Outstanding by party
        </h2>
        <Button
          type="button"
          className="h-11 w-full sm:h-9 sm:w-auto"
          onClick={() => setRecordOpen(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Record recovery
        </Button>
      </div>

      {dueRows.length === 0 ? (
        <Empty className="rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Banknote />
            </EmptyMedia>
            <EmptyTitle>No outstanding balances</EmptyTitle>
            <EmptyDescription>
              All dispatch-ledger dues for this bill book have been recovered.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                  Party
                </TableHead>
                <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                  Bill book
                </TableHead>
                <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                  Billed
                </TableHead>
                <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                  Recovered
                </TableHead>
                <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                  Due
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dueRows.map((row) => (
                <TableRow key={`${row.dispatchLedgerId}-${row.billBookId}`} className="group/due">
                  <TableCell
                    className="sticky left-0 z-10 max-w-48 min-w-0 truncate bg-background px-3 py-2.5 text-foreground group-hover/due:bg-muted/50"
                    title={row.partyName}
                  >
                    {row.partyName}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-foreground">{row.billBook}</TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                    {formatInr(row.billed)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                    {formatInr(row.recovered)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                    {formatInr(row.due)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Recovery register</h2>
        {recoveries.length === 0 ? (
          <Empty className="rounded-lg border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Banknote />
              </EmptyMedia>
              <EmptyTitle>No recoveries yet</EmptyTitle>
              <EmptyDescription>
                Record a collection against a dispatch ledger to post Dr Cash / Cr party.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Party
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Bill book
                  </TableHead>
                  <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Journal
                  </TableHead>
                  <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                    Remark
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...recoveries]
                  .sort((a, b) => {
                    const dateDiff = b.date.localeCompare(a.date);
                    if (dateDiff !== 0) return dateDiff;
                    return b.id.localeCompare(a.id);
                  })
                  .map((entry) => (
                    <TableRow key={entry.id} className="group/recovery">
                      <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 group-hover/recovery:bg-muted/50">
                        {formatIsoDate(entry.date)}
                      </TableCell>
                      <TableCell
                        className="max-w-48 min-w-0 truncate px-3 py-2.5 text-foreground"
                        title={entry.partyName}
                      >
                        {entry.partyName}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-foreground">
                        {entry.billBook}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                        {formatInr(entry.amount)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex min-w-0 flex-col text-sm">
                          <span className="text-foreground">Dr Cash</span>
                          <span
                            className="truncate text-muted-foreground"
                            title={`Cr ${entry.partyName}`}
                          >
                            Cr {entry.partyName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-56 min-w-0 truncate px-3 py-2.5 text-muted-foreground"
                        title={entry.remark ?? ''}
                      >
                        {entry.remark ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <RecordRecoveryDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        billBookId={billBookId}
        outstanding={outstanding}
      />
    </div>
  );
}
