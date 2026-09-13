import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Landmark,
  MapPin,
  Package2,
  Scale,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { cn } from '@/lib/utils';
import type {
  DispatchPreStorageBagSizeSummary,
  DispatchPreStorageSummaryValues,
} from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';

export type {
  DispatchPreStorageBagSizeSummary,
  DispatchPreStorageSummaryValues,
} from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';

type DispatchPreStorageSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: DispatchPreStorageSummaryValues | null;
  dispatchLedgerLabel: string;
  onBack: () => void;
  onSubmit: (isBooked: boolean) => void;
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

function formatKg(value: number) {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} kg`;
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

function StatPill({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/25 px-3 py-2.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-heading text-base font-semibold tabular-nums text-foreground">
        {value}
        {suffix ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

function activeBagRows(bagSize: DispatchPreStorageBagSizeSummary[]) {
  return bagSize.filter(
    (row) => row.size.trim() !== '' || row.variety.trim() !== '' || row.quantityIssued > 0,
  );
}

function DispatchPreStorageReviewSummary({
  values,
  dispatchLedgerLabel,
}: {
  values: DispatchPreStorageSummaryValues;
  dispatchLedgerLabel: string;
}) {
  const rows = activeBagRows(values.bagSize);
  const totalIssued = rows.reduce((sum, row) => sum + row.quantityIssued, 0);
  const routeLabel =
    values.from.trim() && values.to.trim()
      ? `${values.from.trim()} → ${values.to.trim()}`
      : values.from.trim() || values.to.trim() || 'Dispatch route';

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Truck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight" title={routeLabel}>
              {routeLabel}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs tabular-nums">
            GP #{values.gatePassNo || '—'}
          </Badge>
          {values.manualGatePassNumber?.trim() ? (
            <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs tabular-nums">
              M #{values.manualGatePassNumber}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Qty issued" value={totalIssued.toLocaleString('en-IN')} />
        <StatPill label="Net weight" value={formatKg(values.netWeight)} />
        <StatPill label="Avg / bag" value={formatKg(values.averageWeightPerBag)} />
      </div>

      <div className="space-y-2">
        <SectionLabel icon={ClipboardCheck}>Gate pass</SectionLabel>
        <SummaryCard>
          <DetailRow
            label="Gate pass no."
            value={`#${values.gatePassNo || '—'}`}
            valueClassName="font-mono tabular-nums"
          />
          {values.manualGatePassNumber?.trim() ? (
            <DetailRow
              label="Manual no."
              value={`#${values.manualGatePassNumber}`}
              valueClassName="font-mono tabular-nums"
            />
          ) : null}
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          <DetailRow label="Category" value={values.category} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Landmark}>Accounts</SectionLabel>
        <SummaryCard>
          <DetailRow label="Dispatch ledger" value={dispatchLedgerLabel} icon={Landmark} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={MapPin}>Route &amp; vehicle</SectionLabel>
        <SummaryCard>
          <DetailRow label="From" value={values.from} icon={MapPin} />
          <DetailRow label="To" value={values.to} icon={ArrowRight} valueClassName="text-primary" />
          <DetailRow
            label="Truck"
            value={values.truckNumber || '—'}
            icon={Truck}
            valueClassName="uppercase"
          />
          {values.billNumber.trim() ? (
            <DetailRow label="Bill no." value={values.billNumber} />
          ) : null}
          {values.biltiNo.trim() ? <DetailRow label="Bilti no." value={values.biltiNo} /> : null}
          {values.billBook.trim() ? <DetailRow label="Bill book" value={values.billBook} /> : null}
          {values.biltiBook.trim() ? (
            <DetailRow label="Bilti book" value={values.biltiBook} />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Package2}>Bag lines</SectionLabel>
        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr className="text-left">
                  <th className="h-10 px-3 font-medium text-muted-foreground">Size</th>
                  <th className="h-10 px-3 font-medium text-muted-foreground">Variety</th>
                  <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                    Qty issued
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.size}-${row.variety}-${index}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.size || '—'}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.variety || '—'}</td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {row.quantityIssued.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No bag lines entered.</p>
          </div>
        )}

        <SummaryCard className="mt-3">
          <DetailRow
            label="Total issued"
            value={totalIssued.toLocaleString('en-IN')}
            icon={Package2}
            valueClassName="font-semibold tabular-nums"
          />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Weight</SectionLabel>
        <SummaryCard>
          <DetailRow label="Net weight" value={formatKg(values.netWeight)} />
          <DetailRow label="Average per bag" value={formatKg(values.averageWeightPerBag)} />
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

export function DispatchPreStorageSummarySheet({
  open,
  onOpenChange,
  values,
  dispatchLedgerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: DispatchPreStorageSummarySheetProps) {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleBookingChoice = (isBooked: boolean) => {
    setBookingDialogOpen(false);
    onSubmit(isBooked);
  };

  return (
    <>
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
                <SheetTitle className="font-heading text-base leading-none font-semibold">
                  Review nikasi pass
                </SheetTitle>
                <SheetDescription className="text-xs leading-snug text-muted-foreground">
                  Verify route, accounts, and quantities before confirming.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {values ? (
              <DispatchPreStorageReviewSummary
                values={values}
                dispatchLedgerLabel={dispatchLedgerLabel}
              />
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 px-6 text-center">
                <Truck className="size-7 text-muted-foreground/40" />
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
              onClick={() => setBookingDialogOpen(true)}
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

      <AlertDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>Do you want to adjust booking stock?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleBookingChoice(false)}
            >
              No
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={() => handleBookingChoice(true)}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
