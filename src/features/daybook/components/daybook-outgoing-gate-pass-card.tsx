import { useMemo, useState } from 'react';
import {
  Ban,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Pencil,
  Printer,
  Receipt,
  Scale,
  Sprout,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import { EditOutgoingGatePassSheet } from '@/features/outgoing/forms/edit-outgoing-form';
import { useCancelOutgoingGatePass } from '@/features/outgoing/api/use-cancel-outgoing-gate-pass';
import { nikasiAccent } from '@/features/dispatch-pre-storage/constants/nikasi-accent';
import {
  buildOutgoingBreakdownRows,
  formatDaybookDateTime,
  formatWeightKg,
  sumOutgoingBreakdownTotals,
  totalIssuedBags,
  uniqueOutgoingWeightsKg,
} from '@/features/daybook/utils/daybook-display';
import { cn } from '@/lib/utils';

interface InfoBlockProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
}

function formatOptionalInt(value: number | undefined): string {
  return value != null ? value.toLocaleString('en-IN') : '—';
}

const InfoBlock = ({ label, value, icon: Icon, valueClassName }: InfoBlockProps) => (
  <div className="space-y-1.5">
    <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <p className={cn('text-sm font-semibold text-foreground', valueClassName)}>{value}</p>
  </div>
);

function OutgoingDetailedBreakdown({ gatePass }: { gatePass: DaybookOutgoingEntry }) {
  const rows = useMemo(() => buildOutgoingBreakdownRows(gatePass), [gatePass]);
  const totals = useMemo(() => sumOutgoingBreakdownTotals(rows), [rows]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No order lines recorded for this outgoing pass.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Detailed breakdown
      </h4>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full min-w-180 caption-bottom text-sm">
          <thead className="border-b border-border/50 bg-muted/50">
            <tr>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">Variety</th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="h-10 px-3 text-left font-medium text-muted-foreground">Ref</th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">Weight</th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">Avail</th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">Issued</th>
              <th className="h-10 px-3 text-right font-medium text-muted-foreground">Rem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.type}-${row.location}-${index}`}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2.5 font-medium text-foreground">{row.type}</td>
                <td className="px-3 py-2.5 text-foreground">{row.variety}</td>
                <td className="px-3 py-2.5 font-mono text-sm text-foreground">{row.location}</td>
                <td className="px-3 py-2.5">
                  {row.refGatePassNo != null ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums text-foreground">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />#
                      {row.refGatePassNo}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {formatWeightKg(row.weightInKg)}
                  {row.weightInKg != null ? (
                    <span className="ml-1 font-sans text-sm font-normal text-muted-foreground">
                      kg
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {row.avail.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-destructive">
                  {row.issued.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-primary">
                  {row.rem.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border/50 bg-muted/30">
            <tr>
              <td colSpan={4} className="px-3 py-2.5 text-sm font-semibold text-destructive">
                Total
              </td>
              <td className="px-3 py-2.5 text-right text-sm text-muted-foreground">—</td>
              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-destructive">
                {totals.avail.toLocaleString('en-IN')}
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-destructive">
                {totals.issued.toLocaleString('en-IN')}
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                {totals.rem.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface DaybookOutgoingGatePassCardProps {
  data: DaybookOutgoingEntry;
}

export function DaybookOutgoingGatePassCard({ data: gatePass }: DaybookOutgoingGatePassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState<string | null>(null);

  const { mutateAsync: cancelOutgoingGatePass, isPending: isCancelling } =
    useCancelOutgoingGatePass();

  const farmer = gatePass.farmerStorageLinkId.farmerId;
  const farmerStorageLink = gatePass.farmerStorageLinkId;
  const issuedBags = totalIssuedBags(gatePass);
  const uniqueWeightsKg = uniqueOutgoingWeightsKg(gatePass);
  const createdBy = gatePass.createdBy?.name ?? '—';

  const handleCancelOpenChange = (open: boolean) => {
    if (isCancelling) return;

    setCancelOpen(open);

    if (!open) {
      setRemarks('');
      setRemarksError(null);
    }
  };

  const handleConfirmCancel = async () => {
    const trimmedRemarks = remarks.trim();

    if (!trimmedRemarks) {
      setRemarksError('Cancellation remarks are required');
      return;
    }

    setRemarksError(null);

    try {
      const { message } = await cancelOutgoingGatePass({
        id: gatePass._id,
        cancellationRemarks: trimmedRemarks,
      });

      toast.success(message ?? 'Outgoing gate pass cancelled successfully.', {
        position: 'bottom-right',
      });
      handleCancelOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel outgoing gate pass', {
        position: 'bottom-right',
      });
    }
  };

  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className={cn('h-2 w-2 rounded-full', nikasiAccent.dot)} />
              OGP{' '}
              <span className={cn('font-mono tabular-nums', nikasiAccent.emphasis)}>
                #{gatePass.gatePassNo}
              </span>
            </CardTitle>
            {gatePass.manualGatePassNumber != null && (
              <Badge
                variant="outline"
                className="bg-background font-mono text-xs tabular-nums uppercase"
              >
                Manual: {gatePass.manualGatePassNumber}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {formatDaybookDateTime(gatePass.date)}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className="bg-background text-xs" title={gatePass.variety}>
            {gatePass.variety}
          </Badge>
          {gatePass.category?.trim() ? (
            <Badge variant="outline" className="bg-background text-xs" title={gatePass.category}>
              {gatePass.category}
            </Badge>
          ) : null}
          <Badge variant="outline" className="bg-background text-xs tabular-nums">
            {issuedBags.toLocaleString('en-IN')} Bags issued
          </Badge>
          {uniqueWeightsKg.length === 1 ? (
            <Badge
              variant="outline"
              className="bg-background text-xs tabular-nums"
              title="Average bag weight"
            >
              {formatWeightKg(uniqueWeightsKg[0])} kg avg
            </Badge>
          ) : uniqueWeightsKg.length > 1 ? (
            <Badge variant="outline" className="bg-background text-xs" title="Average bag weight">
              Multiple weights
            </Badge>
          ) : null}
          <Badge variant="outline" className={cn('text-xs', nikasiAccent.booked)}>
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBlock label="Farmer" value={farmer.name ?? '—'} icon={User} />
          <InfoBlock
            label="Account"
            value={farmerStorageLink.accountNumber ?? '—'}
            valueClassName="tabular-nums"
          />
          <InfoBlock label="From" value={gatePass.from || '—'} icon={Truck} />
          <InfoBlock label="To" value={gatePass.to || '—'} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <InfoBlock
            label="Bill no."
            value={formatOptionalInt(gatePass.billNumber)}
            icon={Receipt}
            valueClassName="tabular-nums"
          />
          <InfoBlock
            label="Bilti no."
            value={formatOptionalInt(gatePass.biltiNumber)}
            valueClassName="tabular-nums"
          />
          <InfoBlock
            label="Bill book"
            value={formatOptionalInt(gatePass.billBook)}
            valueClassName="tabular-nums"
          />
          <InfoBlock
            label="Bilti book"
            value={formatOptionalInt(gatePass.biltiBook)}
            valueClassName="tabular-nums"
          />
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="space-y-6">
              <OutgoingDetailedBreakdown gatePass={gatePass} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Farmer information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="Name" value={farmer.name ?? '—'} />
                    <InfoBlock label="Mobile" value={farmer.mobileNumber ?? '—'} />
                    <div className="col-span-2">
                      <InfoBlock label="Address" value={farmer.address ?? '—'} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Route &amp; vehicle
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="From" value={gatePass.from || '—'} />
                    <InfoBlock label="To" value={gatePass.to || '—'} />
                    <InfoBlock
                      label="Truck"
                      value={gatePass.truckNumber || '—'}
                      valueClassName="font-mono uppercase"
                    />
                    <InfoBlock label="Variety" value={gatePass.variety} icon={Sprout} />
                    <InfoBlock
                      label="Avg. weight"
                      value={
                        uniqueWeightsKg.length === 1
                          ? `${formatWeightKg(uniqueWeightsKg[0])} kg`
                          : uniqueWeightsKg.length > 1
                            ? 'Multiple'
                            : '—'
                      }
                      icon={Scale}
                      valueClassName="tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Receipt className={cn('h-4 w-4', nikasiAccent.icon)} />
                  Billing &amp; bilti
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-5">
                  <InfoBlock label="Category" value={gatePass.category?.trim() || '—'} />
                  <InfoBlock
                    label="Bill no."
                    value={formatOptionalInt(gatePass.billNumber)}
                    valueClassName="tabular-nums"
                  />
                  <InfoBlock
                    label="Bilti no."
                    value={formatOptionalInt(gatePass.biltiNumber)}
                    valueClassName="tabular-nums"
                  />
                  <InfoBlock
                    label="Bill book"
                    value={formatOptionalInt(gatePass.billBook)}
                    valueClassName="tabular-nums"
                  />
                  <InfoBlock
                    label="Bilti book"
                    value={formatOptionalInt(gatePass.biltiBook)}
                    valueClassName="tabular-nums"
                  />
                </div>
              </div>

              {gatePass.remarks?.trim() ? (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Remarks
                  </h4>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">
                      &ldquo;{gatePass.remarks}&rdquo;
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <InfoBlock label="Created by" value={createdBy} />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              View less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              View full details
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8"
            aria-label={`Edit outgoing gate pass ${gatePass.gatePassNo}`}
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-muted-foreground hover:text-destructive"
            aria-label={`Mark outgoing gate pass ${gatePass.gatePassNo} as null`}
            onClick={() => setCancelOpen(true)}
          >
            <Ban className="mr-2 h-3.5 w-3.5" />
            Mark as null
          </Button>
          <Button variant="secondary" size="sm" className="h-8">
            <Printer className="mr-2 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </CardFooter>

      <EditOutgoingGatePassSheet open={editOpen} onOpenChange={setEditOpen} gatePass={gatePass} />

      <AlertDialog open={cancelOpen} onOpenChange={handleCancelOpenChange}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>Mark OGP #{gatePass.gatePassNo} as null?</AlertDialogTitle>
            <AlertDialogDescription>
              Stock on linked storage gate passes will be restored. This pass will be removed from
              the daybook.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label
              htmlFor={`cancel-remarks-${gatePass._id}`}
              className="text-sm font-medium text-foreground"
            >
              Cancellation remarks
            </label>
            <Textarea
              id={`cancel-remarks-${gatePass._id}`}
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                if (remarksError) setRemarksError(null);
              }}
              placeholder="e.g. Issued in error — wrong truck and quantity"
              className="min-h-[88px] resize-y text-base"
              aria-invalid={remarksError != null}
              disabled={isCancelling}
            />
            {remarksError ? <p className="text-sm text-destructive">{remarksError}</p> : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep active</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!remarks.trim() || isCancelling}
              onClick={() => void handleConfirmCancel()}
            >
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark as null
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function DaybookOutgoingGatePassCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-20" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
