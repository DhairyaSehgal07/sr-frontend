import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Ban,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Package,
  Pencil,
  Printer,
  Scale,
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
import { cn } from '@/lib/utils';
import { useMarkNikasiGatePassNull } from '@/features/dispatch-pre-storage/api/use-mark-nikasi-gate-pass-null';
import type {
  NikasiGatePass,
  NikasiGatePassBagSizeItem,
} from '@/features/dispatch-pre-storage/api/types';
import { nikasiAccent } from '@/features/dispatch-pre-storage/constants/nikasi-accent';
import { openNikasiGatePassPrint } from '@/features/dispatch-pre-storage/utils/nikasi-gate-pass-print';

interface InfoBlockProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatWeight(value: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatOptionalInt(value: number | undefined) {
  return value != null ? value.toLocaleString('en-IN') : '—';
}

function formatBillBook(value: string | number | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function nikasiTotalBags(bagSize: readonly NikasiGatePassBagSizeItem[]): number {
  return bagSize.reduce((sum, row) => sum + row.quantityIssued, 0);
}

interface DispatchPreStorageGatePassCardProps {
  data: NikasiGatePass;
}

export function DispatchPreStorageGatePassCard({
  data: gatePass,
}: DispatchPreStorageGatePassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [markNullOpen, setMarkNullOpen] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: markNikasiGatePassNull, isPending: isMarkingNull } =
    useMarkNikasiGatePassNull();

  const farmerStorageLink = gatePass.farmerStorageLinkId;
  const farmer = farmerStorageLink?.farmerId;
  const dispatchParty = gatePass.dispatchLedgerId;
  const totalBags = nikasiTotalBags(gatePass.bagSize);
  const createdBy = gatePass.createdBy?.name ?? '—';
  const showCostPerBag = gatePass.bagSize.some(
    (row) => row.costPerBag != null && Number.isFinite(row.costPerBag),
  );

  const handleMarkNullOpenChange = (open: boolean) => {
    if (isMarkingNull) return;
    setMarkNullOpen(open);
  };

  const handleConfirmMarkNull = async () => {
    try {
      const { message } = await markNikasiGatePassNull(gatePass._id);

      toast.success(message ?? 'Nikasi gate pass marked null.', {
        position: 'bottom-right',
      });
      setMarkNullOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to mark nikasi gate pass as null',
        { position: 'bottom-right' },
      );
    }
  };

  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className={cn('h-2 w-2 rounded-full', nikasiAccent.dot)} />
              NGP{' '}
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
          <CardDescription className="text-xs">{formatDateTime(gatePass.date)}</CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="max-w-36 truncate bg-background text-xs"
            title={gatePass.category}
          >
            {gatePass.category}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              gatePass.isBooked ? nikasiAccent.booked : 'bg-background text-muted-foreground',
            )}
          >
            {gatePass.isBooked ? 'Booked' : 'Not booked'}
          </Badge>
          <Badge variant="outline" className="bg-background text-xs tabular-nums">
            {totalBags.toLocaleString('en-IN')} Bags
          </Badge>
          <Badge variant="outline" className="bg-background text-xs tabular-nums">
            {formatWeight(gatePass.netWeight)} kg
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {farmer ? <InfoBlock label="Farmer" value={farmer.name ?? '—'} icon={User} /> : null}
          {farmerStorageLink ? (
            <InfoBlock
              label="Account"
              value={farmerStorageLink.accountNumber ?? '—'}
              valueClassName="tabular-nums"
            />
          ) : null}
          <InfoBlock label="Dispatch party" value={dispatchParty.name ?? '—'} icon={Building2} />
          <InfoBlock label="Truck" value={gatePass.truckNumber || '—'} icon={Truck} />
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                {farmerStorageLink || farmer ? (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className={cn('h-4 w-4', nikasiAccent.icon)} />
                      Farmer information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                      <InfoBlock label="Name" value={farmer?.name ?? '—'} />
                      <InfoBlock label="Mobile" value={farmer?.mobileNumber ?? '—'} />
                      <div className="col-span-2">
                        <InfoBlock label="Address" value={farmer?.address ?? '—'} />
                      </div>
                      <InfoBlock
                        label="Account"
                        value={farmerStorageLink?.accountNumber ?? '—'}
                        valueClassName="tabular-nums"
                      />
                      <InfoBlock
                        label="Linked by"
                        value={farmerStorageLink?.linkedById?.name ?? '—'}
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Building2 className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Dispatch party
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="Name" value={dispatchParty.name ?? '—'} />
                    <InfoBlock label="Mobile" value={dispatchParty.mobileNumber ?? '—'} />
                    <div className="col-span-2">
                      <InfoBlock label="Address" value={dispatchParty.address ?? '—'} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Remarks
                  </h4>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">
                      {gatePass.remarks ? `"${gatePass.remarks}"` : 'No remarks provided.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Movement & billing
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="From" value={gatePass.from || '—'} />
                    <InfoBlock label="To" value={gatePass.to || '—'} />
                    <InfoBlock label="Transport company" value={gatePass.transportCompany || '—'} />
                    <InfoBlock label="L.S. No." value={gatePass.LSNumber || '—'} />
                    <InfoBlock label="Driver name" value={gatePass.driverName || '—'} />
                    <InfoBlock
                      label="Driver mobile"
                      value={gatePass.driverMobile || '—'}
                      valueClassName="tabular-nums"
                    />
                    <InfoBlock label="Owner" value={gatePass.owner || '—'} />
                    <InfoBlock
                      label="Bill no."
                      value={formatOptionalInt(gatePass.billNumber)}
                      valueClassName="tabular-nums"
                    />
                    <InfoBlock
                      label="Bitli no."
                      value={formatOptionalInt(gatePass.bitliNumber)}
                      valueClassName="tabular-nums"
                    />
                    <InfoBlock label="Bill book" value={formatBillBook(gatePass.billBook)} />
                    <InfoBlock
                      label="Bilti book"
                      value={formatOptionalInt(gatePass.biltiBook)}
                      valueClassName="tabular-nums"
                    />
                    <InfoBlock
                      label="Net weight"
                      value={`${formatWeight(gatePass.netWeight)} kg`}
                      icon={Scale}
                      valueClassName="tabular-nums"
                    />
                    <InfoBlock
                      label="Avg / bag"
                      value={`${formatWeight(gatePass.averageWeightPerBag)} kg`}
                      valueClassName="tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className={cn('h-4 w-4', nikasiAccent.icon)} />
                    Bag lines
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b border-border/50 bg-muted/50">
                        <tr>
                          <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">
                            Size
                          </th>
                          <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">
                            Variety
                          </th>
                          <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
                            Qty issued
                          </th>
                          {showCostPerBag ? (
                            <th className="h-10 px-3 text-right text-xs font-medium text-muted-foreground">
                              Cost / bag
                            </th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {gatePass.bagSize.map((slot, index) => (
                          <tr
                            key={`${slot.size}-${slot.variety}-${index}`}
                            className="border-b border-border/40 last:border-0"
                          >
                            <td className="px-3 py-2.5 font-medium text-foreground">{slot.size}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{slot.variety}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-foreground tabular-nums">
                              {slot.quantityIssued.toLocaleString('en-IN')}
                            </td>
                            {showCostPerBag ? (
                              <td className="px-3 py-2.5 text-right font-medium text-foreground tabular-nums">
                                {slot.costPerBag != null && Number.isFinite(slot.costPerBag)
                                  ? formatInr(slot.costPerBag)
                                  : '—'}
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <InfoBlock label="Created by" value={createdBy} />
                </div>
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
            aria-label={`Edit nikasi gate pass ${gatePass.gatePassNo}`}
            onClick={() =>
              navigate({
                to: '/dispatch/$id',
                params: { id: gatePass._id },
              })
            }
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-muted-foreground hover:text-destructive"
            aria-label={`Mark nikasi gate pass ${gatePass.gatePassNo} as null`}
            onClick={() => setMarkNullOpen(true)}
          >
            <Ban className="mr-2 h-3.5 w-3.5" />
            Mark as null
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8"
            title="Print invoice"
            aria-label={`Print invoice for nikasi gate pass ${gatePass.gatePassNo}`}
            onClick={() =>
              void openNikasiGatePassPrint('invoice', gatePass, { invoiceLayout: 'sale' })
            }
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8"
            title="Print bilti"
            aria-label={`Print bilti for nikasi gate pass ${gatePass.gatePassNo}`}
            onClick={() => void openNikasiGatePassPrint('bilti', gatePass)}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>

      <AlertDialog open={markNullOpen} onOpenChange={handleMarkNullOpenChange}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>Mark NGP #{gatePass.gatePassNo} as null?</AlertDialogTitle>
            <AlertDialogDescription>
              Shed and booking quantities are restored, and the linked sale is marked null. This
              pass is removed from the daybook, search, and dispatch report. The gate pass number
              stays taken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingNull}>Keep active</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isMarkingNull}
              onClick={() => void handleConfirmMarkNull()}
            >
              {isMarkingNull ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark as null
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function DispatchPreStorageGatePassCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
