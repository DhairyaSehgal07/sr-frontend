import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import {
  Ban,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  Pencil,
  Printer,
  Truck,
  User,
  Weight,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { IncomingGatePass } from '@/features/incoming/api/types';
import { JUTE_BAG_WEIGHT } from '@/lib/constants';

const STATUS_LABELS = {
  NOT_GRADED: 'Ungraded',
  GRADED: 'Graded',
} as const;

export type GatePassData = IncomingGatePass;

interface InfoBlockProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
}

const InfoBlock = ({ label, value, icon: Icon, valueClassName }: InfoBlockProps) => (
  <div className="space-y-1.5">
    <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <p className={cn('text-sm font-semibold text-foreground', valueClassName)}>{value}</p>
  </div>
);

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === 'NOT_GRADED' || status === 'GRADED') {
    return STATUS_LABELS[status];
  }
  return status;
}

interface GatePassCardProps {
  data: GatePassData;
  canUpdate?: boolean;
  onEdit?: (data: GatePassData) => void;
}

export function GatePassCard({ data: gatePass, canUpdate = true, onEdit }: GatePassCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const farmer = gatePass.farmerStorageLinkId.farmerId;
  const farmerStorageLink = gatePass.farmerStorageLinkId;
  const createdBy = gatePass.createdBy.name;
  const statusLabel = getStatusLabel(gatePass.status);
  const gross = gatePass.weightSlip?.grossWeightKg ?? 0;
  const tare = gatePass.weightSlip?.tareWeightKg ?? 0;
  const netKg = gross - tare;
  const bardanaKg = gatePass.bagsReceived * JUTE_BAG_WEIGHT;
  const netProductKg = netKg - bardanaKg;
  const isCancelledGatePass = gatePass.bagsReceived === 0;

  const handleEditClick = () => {
    if (!canUpdate) return;

    if (gatePass.status === 'GRADED') {
      toast.error('Cannot edit graded gate pass', {
        description:
          'This entry is linked to a grading gate pass. Open the grading gate pass and unlink this incoming gate pass before making changes.',
        position: 'bottom-right',
      });
      return;
    }

    if (onEdit) {
      onEdit(gatePass);
      return;
    }

    navigate({
      to: '/incoming/$id',
      params: { id: gatePass._id },
    });
  };

  return (
    <Card
      className={cn(
        'overflow-hidden',
        !isCancelledGatePass && 'card-hover border-border/60',
        isCancelledGatePass && 'border-border/40 bg-muted/20 opacity-70 saturate-50',
      )}
    >
      {isCancelledGatePass && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/5 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-background/80 px-6 py-4 shadow-sm">
            <Ban className="h-8 w-8 text-muted-foreground/60" />
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Cancelled Entry
            </span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-primary" />
              IGP <span className="text-primary">#{gatePass.gatePassNo}</span>
            </CardTitle>
            {gatePass.manualGatePassNumber && (
              <Badge variant="outline" className="bg-background text-[10px] uppercase">
                Manual: {gatePass.manualGatePassNumber}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">{formatDateTime(gatePass.date)}</CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="max-w-36 truncate bg-background text-[11px]"
            title={gatePass.category}
          >
            {gatePass.category}
          </Badge>
          {gatePass.stage ? (
            <Badge variant="outline" className="bg-muted/40 font-mono text-[11px] tabular-nums">
              {gatePass.stage}
            </Badge>
          ) : null}
          <Badge variant="outline" className="bg-background text-[11px] tabular-nums">
            {gatePass.bagsReceived.toLocaleString('en-IN')} Bags
          </Badge>
          <Badge
            variant={gatePass.status === 'NOT_GRADED' ? 'secondary' : 'default'}
            className={cn(
              'text-[11px]',
              gatePass.status === 'NOT_GRADED' &&
                'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60',
            )}
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      {/* Main Card Content */}
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <InfoBlock label="Farmer" value={farmer.name ?? '--'} icon={User} />
          <InfoBlock label="Account" value={farmerStorageLink.accountNumber ?? '--'} />
          <InfoBlock label="Truck" value={gatePass.truckNumber} icon={Truck} />
          <InfoBlock label="Variety" value={gatePass.variety} icon={Package} />
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Farmer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <InfoBlock label="Name" value={farmer.name ?? '--'} />
                    <InfoBlock label="Mobile" value={farmer.mobileNumber ?? '--'} />
                    <div className="col-span-2">
                      <InfoBlock label="Address" value={farmer.address ?? '--'} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Remarks
                  </h4>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-sm italic text-muted-foreground">
                      {gatePass.remarks ? `"${gatePass.remarks}"` : 'No remarks provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Weight Slip Calculation */}
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Weight className="h-4 w-4 text-primary" />
                      Weight Calculation
                    </h4>
                    <Badge variant="outline" className="bg-muted/30 text-xs font-mono">
                      Slip #{gatePass.weightSlip?.slipNumber ?? '--'}
                    </Badge>
                  </div>

                  {/* Tabular Receipt UI */}
                  <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                    <div className="space-y-3 text-sm">
                      {/* Gross */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gross Weight</span>
                        <span className="font-medium text-foreground">
                          {gross.toLocaleString('en-IN')} kg
                        </span>
                      </div>

                      {/* Tare */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tare Weight</span>
                        <span className="text-muted-foreground">
                          - {tare.toLocaleString('en-IN')} kg
                        </span>
                      </div>

                      {/* Subtotal (Net) */}
                      <div className="border-t border-border/60 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">Net Weight</span>
                          <span className="font-semibold text-foreground">
                            {netKg.toLocaleString('en-IN')} kg
                          </span>
                        </div>
                      </div>

                      {/* Bardana Deduction */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-muted-foreground">
                          Bardana{' '}
                          <span className="text-xs opacity-70">
                            ({gatePass.bagsReceived} bags × {JUTE_BAG_WEIGHT}kg)
                          </span>
                        </span>
                        <span className="font-medium text-red-500/90">
                          - {bardanaKg.toLocaleString('en-IN')} kg
                        </span>
                      </div>

                      {/* Final Total */}
                      <div className="border-t-2 border-dashed border-border/80 pt-4 mt-4">
                        <div className="flex items-center justify-between text-base">
                          <span className="font-bold text-foreground">Final Weight</span>
                          <span className="font-bold text-primary">
                            {netProductKg.toLocaleString('en-IN')} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 rounded-xl border border-border/50 bg-muted/20 p-4">
                  <InfoBlock label="Created By" value={createdBy} />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Card Footer (Actions) */}
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> View Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> View Full Details
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="h-8 bg-background"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-8">
            <Printer className="mr-2 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function GatePassCardSkeleton() {
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
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
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
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
