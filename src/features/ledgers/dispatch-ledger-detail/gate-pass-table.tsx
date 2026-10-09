import { Link } from '@tanstack/react-router';
import { CircleCheck, CircleDashed, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBags, formatIsoDate } from '@/features/finances/lib/format';

import type { PartyGatePass } from '../api/types';
import { formatBilti, formatWeight, gatePassBags, gatePassBillBookName } from './lib';
import { RecordField } from './record';

type GatePassTableProps = {
  passes: readonly PartyGatePass[];
  bookFiltered: boolean;
};

function BookedBadge({ booked }: { booked: boolean }) {
  return booked ? (
    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
      <CircleCheck className="size-3" aria-hidden="true" />
      Booked
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <CircleDashed className="size-3" aria-hidden="true" />
      Not booked
    </Badge>
  );
}

function Quantity({ value, unit }: { value: string; unit: string }) {
  return (
    <>
      {value} <span className="text-muted-foreground">{unit}</span>
    </>
  );
}

export function GatePassTable({ passes, bookFiltered }: GatePassTableProps) {
  if (passes.length === 0) {
    return (
      <Empty className="rounded-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Truck />
          </EmptyMedia>
          <EmptyTitle>
            {bookFiltered ? 'No gate passes in this bill book' : 'No gate passes yet'}
          </EmptyTitle>
          <EmptyDescription>
            {bookFiltered
              ? 'Nothing has been dispatched to this party on the selected bill book.'
              : 'Dispatch vouchers for this party will show the bags and weight that left the store.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {passes.map((pass) => {
          const route = `${pass.from} → ${pass.to}`;
          const bookName = gatePassBillBookName(pass);
          const description = [
            formatIsoDate(pass.date),
            route,
            pass.manualGatePassNumber != null ? `Manual ${pass.manualGatePassNumber}` : '',
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <Card key={pass._id} size="sm">
              <CardHeader>
                <CardTitle>
                  <Link
                    to="/dispatch/$id"
                    params={{ id: pass._id }}
                    className="font-mono text-base font-medium text-primary tabular-nums underline-offset-4 hover:underline"
                    aria-label={`Open gate pass ${pass.gatePassNo}`}
                  >
                    GP {pass.gatePassNo}
                  </Link>
                </CardTitle>
                <CardDescription className="truncate" title={description}>
                  {description}
                </CardDescription>
                <CardAction>
                  <BookedBadge booked={pass.isBooked} />
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <RecordField label="Truck">
                  <span className="font-mono tabular-nums">{pass.truckNumber}</span>
                </RecordField>
                <RecordField label="Category">{pass.category}</RecordField>
                <RecordField label="Bags">
                  <span className="font-medium tabular-nums">
                    <Quantity value={formatBags(gatePassBags(pass))} unit="bags" />
                  </span>
                </RecordField>
                <RecordField label="Net weight">
                  {Number.isFinite(pass.netWeight) ? (
                    <span className="font-medium tabular-nums">
                      <Quantity value={formatWeight(pass.netWeight)} unit="kg" />
                    </span>
                  ) : (
                    '—'
                  )}
                </RecordField>
                <RecordField label="Bill book">
                  <span className="truncate" title={bookName}>
                    {bookName}
                  </span>
                </RecordField>
                <RecordField label="Bill no">
                  <span className="font-mono tabular-nums">
                    {pass.billNumber != null ? pass.billNumber : '—'}
                  </span>
                </RecordField>
                <RecordField label="Bilti">
                  <span className="font-mono tabular-nums">{formatBilti(pass)}</span>
                </RecordField>
                {pass.bagSize.length > 0 ? (
                  <>
                    <Separator className="my-1" />
                    <ul className="flex flex-col gap-2">
                      {pass.bagSize.map((row, index) => (
                        <li
                          key={`${row.variety}-${row.size}-${index}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="min-w-0 text-foreground">
                            <span className="font-medium">{row.variety || 'Not specified'}</span>
                            <span className="text-muted-foreground"> · </span>
                            {row.size || 'Not specified'}
                          </span>
                          <span className="shrink-0 font-medium text-foreground tabular-nums">
                            {formatBags(row.quantityIssued)}{' '}
                            <span className="font-normal text-muted-foreground">bags</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
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
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Route</TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Truck</TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Bags
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Net weight
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">
                Bill book
              </TableHead>
              <TableHead className="h-10 px-3 text-right font-medium text-muted-foreground">
                Bill no
              </TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Bilti</TableHead>
              <TableHead className="h-10 px-3 font-medium text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passes.map((pass) => {
              const route = `${pass.from} → ${pass.to}`;
              const bookName = gatePassBillBookName(pass);

              return (
                <TableRow key={pass._id} className="group/pass">
                  <TableCell className="sticky left-0 z-10 bg-background px-3 py-2.5 group-hover/pass:bg-muted/50">
                    {formatIsoDate(pass.date)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex min-w-0 flex-col">
                      <Link
                        to="/dispatch/$id"
                        params={{ id: pass._id }}
                        className="font-mono text-sm font-medium text-primary tabular-nums underline-offset-4 hover:underline"
                        aria-label={`Open gate pass ${pass.gatePassNo}`}
                      >
                        {pass.gatePassNo}
                      </Link>
                      {pass.manualGatePassNumber != null ? (
                        <span className="font-mono text-sm text-muted-foreground tabular-nums">
                          Manual {pass.manualGatePassNumber}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell
                    className="max-w-48 min-w-0 truncate px-3 py-2.5 text-foreground"
                    title={route}
                  >
                    {route}
                  </TableCell>
                  <TableCell
                    className="max-w-36 min-w-0 truncate px-3 py-2.5 font-mono text-sm text-foreground tabular-nums"
                    title={pass.truckNumber}
                  >
                    {pass.truckNumber}
                  </TableCell>
                  <TableCell
                    className="max-w-36 min-w-0 truncate px-3 py-2.5 text-foreground"
                    title={pass.category}
                  >
                    {pass.category}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums">
                    <Quantity value={formatBags(gatePassBags(pass))} unit="bags" />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums">
                    {Number.isFinite(pass.netWeight) ? (
                      <Quantity value={formatWeight(pass.netWeight)} unit="kg" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell
                    className="max-w-40 min-w-0 truncate px-3 py-2.5 text-foreground"
                    title={bookName}
                  >
                    {bookName}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right font-mono text-sm text-foreground tabular-nums">
                    {pass.billNumber != null ? pass.billNumber : '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 font-mono text-sm text-foreground tabular-nums">
                    {formatBilti(pass)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <BookedBadge booked={pass.isBooked} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
