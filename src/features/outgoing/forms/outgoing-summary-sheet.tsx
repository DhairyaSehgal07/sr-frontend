import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPin,
  Receipt,
  Scale,
  Truck,
  User2,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { OutgoingSummaryValues } from '@/features/outgoing/schemas/outgoing-form-schema';
import { AllocationReviewByVariety } from '@/features/transfer-stock/forms/allocation-review-by-variety';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { cn } from '@/lib/utils';

type OutgoingSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: OutgoingSummaryValues | null;
  farmerLabel: string;
  outgoingItems: TransferStockItem[];
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

function OutgoingReviewSummary({
  values,
  farmerLabel,
  outgoingItems,
}: {
  values: OutgoingSummaryValues;
  farmerLabel: string;
  outgoingItems: TransferStockItem[];
}) {
  const totalBags = outgoingItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ArrowUpRight className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">Stock outgoing</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={User2}>Account</SectionLabel>
        <SummaryCard>
          <DetailRow label="Farmer" value={farmerLabel} icon={User2} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Calendar}>Outgoing date</SectionLabel>
        <SummaryCard>
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          {values.manualGatePassNumber != null ? (
            <DetailRow
              label="Manual GP no."
              value={values.manualGatePassNumber.toLocaleString('en-IN')}
              valueClassName="font-mono tabular-nums"
            />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Truck}>Route &amp; vehicle</SectionLabel>
        <SummaryCard>
          <DetailRow label="From" value={values.from} icon={MapPin} />
          <DetailRow label="To" value={values.to} icon={MapPin} />
          {values.truckNumber.trim() ? (
            <DetailRow
              label="Truck"
              value={values.truckNumber}
              icon={Truck}
              valueClassName="font-mono uppercase"
            />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Receipt}>Billing &amp; bilti</SectionLabel>
        <SummaryCard>
          <DetailRow label="Category" value={values.category} />
          <DetailRow
            label="Bill no."
            value={Number(values.billNumber).toLocaleString('en-IN')}
            valueClassName="tabular-nums"
          />
          <DetailRow
            label="Bilti no."
            value={Number(values.biltiNumber).toLocaleString('en-IN')}
            valueClassName="tabular-nums"
          />
          <DetailRow label="Bill book" value={values.billBook} />
          <DetailRow label="Bilti book" value={values.biltiBook} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Allocations</SectionLabel>
        <AllocationReviewByVariety items={outgoingItems} weightsBySize={values.weightsBySize} />
        <SummaryCard className="mt-3">
          <DetailRow
            label="Total bags"
            value={totalBags.toLocaleString('en-IN')}
            icon={Warehouse}
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

export function OutgoingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerLabel,
  outgoingItems,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: OutgoingSummarySheetProps) {
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
                Review outgoing
              </SheetTitle>
              <SheetDescription className="text-xs leading-snug text-muted-foreground">
                Verify farmer, allocations, and date before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <OutgoingReviewSummary
              values={values}
              farmerLabel={farmerLabel}
              outgoingItems={outgoingItems}
            />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 px-6 text-center">
              <ArrowUpRight className="size-7 text-muted-foreground/40" />
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
