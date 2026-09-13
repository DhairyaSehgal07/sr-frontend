import { useMemo, type ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Package2,
  Scale,
  Sprout,
  TriangleAlert,
  Truck,
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
import { resolveSelectedIncomingGatePasses } from '@/features/grading/utils/resolve-selected-incoming-gate-passes';
import {
  formatIncomingWeightKg,
  incomingNetWeightKg,
} from '@/features/grading/utils/incoming-net-weight';
import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';
import { gradingTotalWeightKg } from '@/features/grading/schemas/grading-fill-details-schema';
import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';
import { useIncomingGatePassesByFarmer } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer';
import { JUTE_BAG_WEIGHT, LENO_BAG_WEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type GradingSummaryValues = GradingFormValues;

type FarmerOption = { id: string; label: string };

type GradingSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: GradingSummaryValues | null;
  farmerOptions: readonly FarmerOption[];
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

function getFarmerLabel(farmerStorageLinkId: string, farmerOptions: readonly FarmerOption[]) {
  return (
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ?? farmerStorageLinkId
  );
}

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

function formatGatePassDate(iso: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatKg(value: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

function activeQuantityRows(quantities: GradingSummaryValues['quantities']) {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

function getBagWeightKg(bagType: string) {
  return bagType === 'LENO' ? LENO_BAG_WEIGHT : JUTE_BAG_WEIGHT;
}

function gradingRowBagWeightKg(row: GradingSummaryValues['quantities'][number]) {
  return (row.qty ?? 0) * getBagWeightKg(row.bagType);
}

function gradingRowNetProductKg(row: GradingSummaryValues['quantities'][number]) {
  return (row.qty ?? 0) * (row.weight ?? 0) - gradingRowBagWeightKg(row);
}

function gradingTotalBagWeightKg(rows: readonly GradingSummaryValues['quantities'][number][]) {
  return rows.reduce((sum, row) => sum + gradingRowBagWeightKg(row), 0);
}

function gradingTotalNetProductKg(rows: readonly GradingSummaryValues['quantities'][number][]) {
  return rows.reduce((sum, row) => sum + gradingRowNetProductKg(row), 0);
}

function incomingTotalNetWeightKg(gatePasses: readonly GradingSelectIncomingGatePasses[]) {
  const weights = gatePasses.map(incomingNetWeightKg);

  return {
    hasWeight: weights.some((weight) => weight != null),
    totalWeightKg: weights.reduce<number>((sum, weight) => sum + (weight ?? 0), 0),
  };
}

function IncomingGatePassesTable({
  gatePasses,
}: {
  gatePasses: GradingSelectIncomingGatePasses[];
}) {
  const totalBags = gatePasses.reduce((sum, gatePass) => sum + gatePass.bagsReceived, 0);
  const { hasWeight: hasNetWeight, totalWeightKg: totalNetWeightKg } =
    incomingTotalNetWeightKg(gatePasses);

  if (gatePasses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">No incoming gate passes selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full min-w-[460px] caption-bottom text-sm">
          <thead className="border-b border-border/50 bg-muted/50">
            <tr>
              <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                Manual #
              </th>
              <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                Bags
              </th>
              <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                Incoming net wt
              </th>
            </tr>
          </thead>
          <tbody>
            {gatePasses.map((gatePass) => {
              const netWeightKg = incomingNetWeightKg(gatePass);

              return (
                <tr key={gatePass._id} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-2.5 tabular-nums font-medium">
                    {gatePass.manualGatePassNumber}
                  </td>
                  <td className="px-3 py-2.5 text-foreground">
                    {formatGatePassDate(gatePass.date)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                    {gatePass.bagsReceived.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                    {netWeightKg == null ? (
                      '—'
                    ) : (
                      <>
                        {formatIncomingWeightKg(netWeightKg)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SummaryCard>
        <DetailRow
          label="Total incoming bags"
          value={totalBags.toLocaleString('en-IN')}
          valueClassName="font-semibold tabular-nums"
        />
        <DetailRow
          label="Incoming net weight"
          value={
            hasNetWeight ? (
              <>
                {formatIncomingWeightKg(totalNetWeightKg)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
              </>
            ) : (
              '—'
            )
          }
          valueClassName="font-semibold tabular-nums"
        />
      </SummaryCard>
    </div>
  );
}

function GradingReviewSummary({
  values,
  farmerOptions,
  linkedGatePasses = [],
}: {
  values: GradingSummaryValues;
  farmerOptions: readonly FarmerOption[];
  linkedGatePasses?: readonly GradingSelectIncomingGatePasses[];
}) {
  const rows = activeQuantityRows(values.quantities);
  const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0);
  const totalWeightKg = gradingTotalWeightKg(rows);
  const totalGradingBardanaWeightKg = gradingTotalBagWeightKg(rows);
  const totalGradedNetWeightKg = gradingTotalNetProductKg(rows);
  const { data: gatePassResult } = useIncomingGatePassesByFarmer(values.farmerStorageLinkId);
  const selectedIncomingGatePasses = useMemo(
    () =>
      resolveSelectedIncomingGatePasses(values.selectedIncomingGatePassIds, [
        ...(gatePassResult?.incomingGatePasses ?? []),
        ...linkedGatePasses,
      ]),
    [gatePassResult?.incomingGatePasses, linkedGatePasses, values.selectedIncomingGatePassIds],
  );
  const { hasWeight: hasIncomingNetWeight, totalWeightKg: incomingNetWeightKgTotal } =
    incomingTotalNetWeightKg(selectedIncomingGatePasses);
  const gradingWastageKg = incomingNetWeightKgTotal - totalGradedNetWeightKg;
  const gradingWastagePercent =
    incomingNetWeightKgTotal > 0 ? (gradingWastageKg / incomingNetWeightKgTotal) * 100 : 0;

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <SectionLabel icon={ClipboardList}>Selection</SectionLabel>
        <SummaryCard>
          <DetailRow
            label="Farmer"
            value={getFarmerLabel(values.farmerStorageLinkId, farmerOptions)}
          />
          <DetailRow label="Variety" value={values.variety} icon={Sprout} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Truck}>Incoming gate passes</SectionLabel>
        <IncomingGatePassesTable gatePasses={selectedIncomingGatePasses} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Package2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Grading details</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {values.manualGatePassNumber != null && (
            <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
              #{values.manualGatePassNumber}
            </Badge>
          )}
          <Badge variant="secondary" className="h-5 px-2 text-[11px]">
            {totalBags.toLocaleString('en-IN')} bags
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Calendar}>General</SectionLabel>
        <SummaryCard>
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          <DetailRow
            label="Manual gate pass"
            value={values.manualGatePassNumber != null ? `#${values.manualGatePassNumber}` : '—'}
          />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Package2}>Quantities</SectionLabel>
        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-border/50 bg-muted/50">
                <tr>
                  <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                    wt (kg)/bag
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.size}-${index}`}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.size}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {(row.qty ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.bagType}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.weight != null ? (
                        <>
                          {formatKg(row.weight)}
                          <span className="ml-0.5 text-xs text-muted-foreground">kg</span>
                        </>
                      ) : (
                        '—'
                      )}
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
            valueClassName="font-semibold tabular-nums"
          />
          <DetailRow
            label="Total weight"
            value={
              <>
                {formatKg(totalWeightKg)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
              </>
            }
            valueClassName="font-semibold tabular-nums"
          />
          <DetailRow
            label="Bardana weight"
            value={
              <>
                − {formatKg(totalGradingBardanaWeightKg)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
              </>
            }
            valueClassName="font-semibold tabular-nums text-destructive"
          />
          <DetailRow
            label="Net grading weight"
            value={
              <>
                {formatKg(totalGradedNetWeightKg)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
              </>
            }
            valueClassName="font-semibold tabular-nums text-primary"
          />
        </SummaryCard>
      </div>

      {hasIncomingNetWeight ? (
        <div className="space-y-2">
          <SectionLabel icon={Scale}>Performance metrics</SectionLabel>
          <SummaryCard>
            <DetailRow
              label="Total graded weight"
              value={
                <>
                  {formatKg(totalGradedNetWeightKg)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
                </>
              }
              icon={Scale}
              valueClassName="font-semibold tabular-nums text-primary"
            />
            <DetailRow
              label="Grading wastage"
              value={
                <>
                  {formatKg(gradingWastageKg)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
                </>
              }
              icon={TriangleAlert}
              valueClassName={cn(
                'font-semibold tabular-nums',
                gradingWastageKg > 0 && 'text-destructive',
                gradingWastageKg <= 0 && 'text-primary',
              )}
            />
            <DetailRow
              label="Wastage"
              value={`${formatKg(gradingWastagePercent)}% of incoming net`}
              valueClassName="font-semibold tabular-nums"
            />
          </SummaryCard>
        </div>
      ) : null}

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

export function GradingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerOptions,
  linkedGatePasses,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: GradingSummarySheetProps) {
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
                Review grading
              </SheetTitle>
              <SheetDescription className="text-xs leading-snug text-muted-foreground">
                Verify bag counts and details before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <GradingReviewSummary
              values={values}
              farmerOptions={farmerOptions}
              linkedGatePasses={linkedGatePasses}
            />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/20 px-6 text-center">
              <Scale className="size-7 text-muted-foreground/40" />
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
