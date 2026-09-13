import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBookingBagCount } from '@/features/booking/lib/booking-summary-utils';
import type { BookingSummaryTableData } from '@/features/booking/types/booking-summary';
import { cn } from '@/lib/utils';

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/35',
  '[&_th:first-child]:border-l [&_td:first-child]:border-l',
  '[&_thead_th]:border-t [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type BookingSummaryTableProps = {
  table: BookingSummaryTableData;
  emptyMessage?: string;
};

export function BookingSummaryTable({
  table,
  emptyMessage = 'No booking summary data available.',
}: BookingSummaryTableProps) {
  const { sizeNames, rows, totals, grandTotal } = table;
  const hasData = rows.length > 0;

  if (!hasData) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  if (sizeNames.length === 0) {
    return <p className="text-sm text-muted-foreground">No size breakdown available.</p>;
  }

  return (
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
                  {formatBookingBagCount(Number(row.values[sizeName] ?? 0))}
                </TableCell>
              ))}
              <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                {formatBookingBagCount(row.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell className="px-3 py-2.5 font-medium text-foreground">Bag total</TableCell>
            {sizeNames.map((sizeName) => (
              <TableCell
                key={`total-${sizeName}`}
                className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary"
              >
                {formatBookingBagCount(totals[sizeName] ?? 0)}
              </TableCell>
            ))}
            <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
              {formatBookingBagCount(grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
