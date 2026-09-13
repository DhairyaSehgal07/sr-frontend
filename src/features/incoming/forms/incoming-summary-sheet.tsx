import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Package2,
  Scale,
  Truck,
  User2,
  Weight,
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
import { JUTE_BAG_WEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type IncomingSummaryValues = {
  manualGatePassNumber?: number;
  truckNumber: string;
  farmerStorageLinkId: string;
  variety: string;
  category: string;
  stage: string;
  date: string;
  bagsReceived: number;
  weightSlip: {
    slipNumber: string;
    grossWeightKg: number;
    tareWeightKg: number;
  };
  remarks: string;
};

type IncomingSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: IncomingSummaryValues | null;
  farmerLabel: string;
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

function formatKg(value: number) {
  return `${value.toLocaleString('en-IN')} kg`;
}

/** A single label → value row used in the detail list */
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
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {label}
      </span>
      <span className={cn('text-sm font-medium text-right text-foreground', valueClassName)}>
        {value ?? '—'}
      </span>
    </div>
  );
}

/** Thin section title with primary-tinted icon */
function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span className="text-[11px] font-bold tracking-widest uppercase text-foreground/70">
        {children}
      </span>
    </div>
  );
}

/** Card wrapper — thin border, very subtle background */
function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card divide-y divide-border/40 px-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

function WeightCard({
  slipNumber,
  grossWeightKg,
  tareWeightKg,
  bagsReceived,
}: {
  slipNumber: string;
  grossWeightKg: number;
  tareWeightKg: number;
  bagsReceived: number;
}) {
  const netWeightKg = grossWeightKg - tareWeightKg;
  const bardanaKg = bagsReceived * JUTE_BAG_WEIGHT;
  const netProductKg = netWeightKg - bardanaKg;

  return (
    <Card>
      {/* slip number header */}
      <div className="flex items-center justify-between py-2.5">
        <span className="text-xs text-muted-foreground">Slip no.</span>
        <span className="font-mono text-xs font-medium text-foreground">#{slipNumber}</span>
      </div>
      <div className="flex items-center justify-between py-2.5">
        <span className="text-xs text-muted-foreground">Gross weight</span>
        <span className="text-sm font-medium tabular-nums">{formatKg(grossWeightKg)}</span>
      </div>
      <div className="flex items-center justify-between py-2.5">
        <span className="text-xs text-muted-foreground">Tare weight</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          −&thinsp;{tareWeightKg.toLocaleString('en-IN')} kg
        </span>
      </div>
      {/* net — slightly elevated */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-semibold text-foreground">Net weight</span>
        <span className="text-base font-bold tabular-nums text-primary">
          {formatKg(netWeightKg)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2.5">
        <span className="text-xs text-muted-foreground">
          Bardana ({bagsReceived.toLocaleString('en-IN')} bags × {JUTE_BAG_WEIGHT}kg)
        </span>
        <span className="text-sm font-medium tabular-nums text-destructive">
          −&thinsp;{bardanaKg.toLocaleString('en-IN')} kg
        </span>
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-semibold text-foreground">Final weight</span>
        <span className="text-base font-bold tabular-nums text-primary">
          {formatKg(netProductKg)}
        </span>
      </div>
    </Card>
  );
}

function IncomingReviewSummary({
  values,
  farmerLabel,
}: {
  values: IncomingSummaryValues;
  farmerLabel: string;
}) {
  return (
    <div className="space-y-7">
      {/* ── Hero pill ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Truck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight uppercase truncate">
              {values.truckNumber}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {values.manualGatePassNumber != null && (
            <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5">
              #{values.manualGatePassNumber}
            </Badge>
          )}
          <Badge variant="secondary" className="text-[11px] h-5 px-2">
            {values.bagsReceived.toLocaleString('en-IN')} bags
          </Badge>
        </div>
      </div>

      {/* ── Farmer ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionLabel icon={User2}>Farmer</SectionLabel>
        <Card>
          <DetailRow label="Linked account" value={farmerLabel} icon={User2} />
        </Card>
      </div>

      {/* ── Crop ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionLabel icon={Package2}>Crop details</SectionLabel>
        <Card>
          <DetailRow label="Variety" value={values.variety} />
          <DetailRow label="Category" value={`Cat. ${values.category}`} />
          <DetailRow label="Stage" value={values.stage} />
          <DetailRow
            label="Bags received"
            value={values.bagsReceived.toLocaleString('en-IN')}
            valueClassName="font-semibold"
          />
        </Card>
      </div>

      {/* ── Weight slip ───────────────────────────────────────── */}
      <div className="space-y-2">
        <SectionLabel icon={Weight}>Weight slip</SectionLabel>
        <WeightCard
          slipNumber={values.weightSlip.slipNumber}
          grossWeightKg={values.weightSlip.grossWeightKg}
          tareWeightKg={values.weightSlip.tareWeightKg}
          bagsReceived={values.bagsReceived}
        />
      </div>

      {/* ── Remarks ───────────────────────────────────────────── */}
      {values.remarks.trim() ? (
        <div className="space-y-2">
          <SectionLabel icon={FileText}>Remarks</SectionLabel>
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground italic whitespace-pre-wrap">
              {values.remarks}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function IncomingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: IncomingSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <SheetHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base font-semibold leading-none">
                Review gate pass
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground leading-snug">
                Verify all fields before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <IncomingReviewSummary values={values} farmerLabel={farmerLabel} />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 text-center px-6">
              <Scale className="size-7 text-muted-foreground/40" />
              <p className="text-sm font-medium">No summary available</p>
              <p className="text-xs text-muted-foreground">
                Complete the form and open review again.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <SheetFooter className="border-t border-border/40 px-5 py-4 flex-row gap-2.5">
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
