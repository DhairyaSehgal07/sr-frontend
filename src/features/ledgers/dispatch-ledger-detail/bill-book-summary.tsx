import { BookOpen } from 'lucide-react';

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
import type { FinanceSummary } from '@/features/finances/api/types';
import { formatInr, paiseToRupees } from '@/features/finances/lib/format';

import type { DispatchLedgerBillBookRow } from '../api/types';
import { RecordCard, RecordField, RecordList } from './record';

type BillBookSummaryProps = {
  rows: DispatchLedgerBillBookRow[];
  summary: FinanceSummary;
  bookFiltered: boolean;
};

function money(paise: number) {
  return formatInr(paiseToRupees(paise));
}

export function BillBookSummary({ rows, summary, bookFiltered }: BillBookSummaryProps) {
  if (rows.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyTitle>
            {bookFiltered ? 'No bills in this bill book' : 'No bills cut yet'}
          </EmptyTitle>
          <EmptyDescription>
            {bookFiltered
              ? 'This party has no sales or recoveries in the selected bill book.'
              : 'Billed amounts will appear here once a gate pass is booked against a bill book.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <RecordList>
        {rows.map((row) => (
          <RecordCard key={row.billBookId}>
            <p className="truncate text-sm font-medium text-foreground" title={row.billBookName}>
              {row.billBookName}
            </p>
            <RecordField label="Billed">
              <span className="font-medium tabular-nums">{money(row.billedPaise)}</span>
            </RecordField>
            <RecordField label="Recovered">
              <span className="font-medium tabular-nums">{money(row.recoveredPaise)}</span>
            </RecordField>
            <RecordField label="Outstanding">
              <span className="font-medium tabular-nums">{money(row.outstandingPaise)}</span>
            </RecordField>
          </RecordCard>
        ))}
        <RecordCard>
          <p className="text-sm font-medium text-foreground">Total</p>
          <RecordField label="Billed">
            <span className="font-medium tabular-nums">{money(summary.billedPaise)}</span>
          </RecordField>
          <RecordField label="Recovered">
            <span className="font-medium tabular-nums">{money(summary.recoveredPaise)}</span>
          </RecordField>
          <RecordField label="Outstanding">
            <span className="font-medium tabular-nums">{money(summary.outstandingPaise)}</span>
          </RecordField>
        </RecordCard>
      </RecordList>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-30 h-10 bg-muted/50 px-3 font-medium text-muted-foreground">
                Bill book
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Billed
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Recovered
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Outstanding
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.billBookId} className="group/book">
                <TableCell
                  className="sticky left-0 z-10 max-w-48 min-w-0 truncate bg-background px-3 py-2.5 text-foreground group-hover/book:bg-muted/50"
                  title={row.billBookName}
                >
                  {row.billBookName}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(row.billedPaise)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(row.recoveredPaise)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                  {money(row.outstandingPaise)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell className="sticky left-0 z-10 bg-muted/50 px-3 py-2.5 font-medium text-foreground">
                Total
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                {money(summary.billedPaise)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                {money(summary.recoveredPaise)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-medium text-foreground tabular-nums">
                {money(summary.outstandingPaise)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}
