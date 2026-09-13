import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Landmark,
  Package2,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { BookingFormValues } from '@/features/booking/schemas/booking-form-schema';
import { cn } from '@/lib/utils';

export type BookingSummaryValues = BookingFormValues;

type BookingSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: BookingSummaryValues | null;
  dispatchLedgerLabel: string;
  gatePassNo: number | null;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

function formatReviewDate(iso: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function DetailRow({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {label}
      </span>
      <span className={cn('text-right text-sm font-medium text-foreground', valueClassName)}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span className="text-[11px] font-bold tracking-widest text-foreground/70 uppercase">
        {children}
      </span>
    </div>
  );
}

function SummaryCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'divide-y divide-border/40 rounded-xl border border-border/50 bg-card px-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

function activeQuantityRows(quantities: BookingSummaryValues['quantities']) {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

function BookingReviewSummary({
  values,
  dispatchLedgerLabel,
  gatePassNo,
}: {
  values: BookingSummaryValues;
  dispatchLedgerLabel: string;
  gatePassNo: number | null;
}) {
  const rows = activeQuantityRows(values.quantities);
  const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Package2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              {dispatchLedgerLabel || '—'}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {gatePassNo != null ? (
            <Badge variant="secondary" className="h-5 px-2 font-mono text-[11px] tabular-nums">
              #{gatePassNo}
            </Badge>
          ) : null}
          {values.manualGatePassNumber != null ? (
            <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
              Manual #{values.manualGatePassNumber}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Landmark}>Dispatch ledger</SectionLabel>
        <SummaryCard>
          <DetailRow label="Linked ledger" value={dispatchLedgerLabel} icon={Landmark} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Package2}>Booking details</SectionLabel>
        <SummaryCard>
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          {gatePassNo != null ? (
            <DetailRow
              label="Gate pass no."
              value={`#${gatePassNo}`}
              valueClassName="font-mono tabular-nums"
            />
          ) : null}
          {values.manualGatePassNumber != null ? (
            <DetailRow
              label="Manual gate pass no."
              value={`#${values.manualGatePassNumber}`}
              valueClassName="font-mono tabular-nums"
            />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Bag quantities</SectionLabel>
        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr className="text-left">
                  <th className="h-10 px-3 font-medium text-muted-foreground">Size</th>
                  <th className="h-10 px-3 font-medium text-muted-foreground">Variety</th>
                  <th className="h-10 px-3 text-right font-medium text-muted-foreground">Qty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.size}-${row.variety}-${index}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.size}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.variety || '—'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {(row.qty ?? 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No bag quantities entered.</p>
          </div>
        )}

        <SummaryCard className="mt-3">
          <DetailRow
            label="Total bags"
            value={totalBags.toLocaleString('en-IN')}
            icon={Scale}
            valueClassName="font-semibold tabular-nums"
          />
        </SummaryCard>
      </div>

      {values.remarks.trim() ? (
        <div className="space-y-2">
          <SectionLabel icon={FileText}>Remarks</SectionLabel>
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
              {values.remarks}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BookingSummarySheet({
  open,
  onOpenChange,
  values,
  dispatchLedgerLabel,
  gatePassNo,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: BookingSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none font-semibold">
                Review booking gate pass
              </SheetTitle>
              <SheetDescription className="text-xs leading-snug text-muted-foreground">
                Verify all fields before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <BookingReviewSummary
              values={values}
              dispatchLedgerLabel={dispatchLedgerLabel}
              gatePassNo={gatePassNo}
            />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 px-6 text-center">
              <Package2 className="size-7 text-muted-foreground/40" />
              <p className="text-sm font-medium">No summary available</p>
              <p className="text-xs text-muted-foreground">
                Complete the form and open review again.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2.5 border-t border-border/40 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              'Submitting…'
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Confirm &amp; submit
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
