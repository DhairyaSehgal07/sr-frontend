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
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Package,
  Pencil,
  Printer,
  Scale,
  Sprout,
  TriangleAlert,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { JUTE_BAG_WEIGHT, LENO_BAG_WEIGHT, type BagType } from '@/lib/constants';
import type {
  GradingGatePass,
  GradingGatePassIncomingRef,
  GradingGatePassFarmerStorageLink,
  GradingOrderDetail,
} from '@/features/grading/api/types';

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
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatKg(value: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function gradingTotalBags(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce((sum, row) => sum + row.quantity, 0);
}

export function gradingTotalWeightKg(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce((sum, row) => sum + row.quantity * row.weightPerBagKg, 0);
}

function getBagWeightKg(bagType: BagType) {
  return bagType === 'LENO' ? LENO_BAG_WEIGHT : JUTE_BAG_WEIGHT;
}

function getIncomingRefWeights(incoming: GradingGatePassIncomingRef) {
  return {
    grossWeightKg: incoming.grossWeightKg ?? incoming.weightSlip?.grossWeightKg ?? 0,
    tareWeightKg: incoming.tareWeightKg ?? incoming.weightSlip?.tareWeightKg ?? 0,
  };
}

function incomingNetProductKg(incoming: GradingGatePassIncomingRef) {
  const { grossWeightKg, tareWeightKg } = getIncomingRefWeights(incoming);
  const netKg = grossWeightKg - tareWeightKg;
  return netKg - incoming.bagsReceived * JUTE_BAG_WEIGHT;
}

function gradingRowBagWeightKg(row: GradingOrderDetail) {
  return row.quantity * getBagWeightKg(row.bagType);
}

function gradingRowNetProductKg(row: GradingOrderDetail) {
  return row.quantity * (row.weightPerBagKg - getBagWeightKg(row.bagType));
}

function gradingTotalBagWeightKg(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce((sum, row) => sum + gradingRowBagWeightKg(row), 0);
}

function gradingTotalNetProductKg(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce((sum, row) => sum + gradingRowNetProductKg(row), 0);
}

function isPopulatedFarmerStorageLink(
  value: GradingGatePass['farmerStorageLinkId'],
): value is GradingGatePassFarmerStorageLink {
  return typeof value !== 'string';
}

interface GradingGatePassCardProps {
  data: GradingGatePass;
  canUpdate?: boolean;
}

export function GradingGatePassCard({
  data: gatePass,
  canUpdate = true,
}: GradingGatePassCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const farmerStorageLink = isPopulatedFarmerStorageLink(gatePass.farmerStorageLinkId)
    ? gatePass.farmerStorageLinkId
    : undefined;
  const farmer = farmerStorageLink?.farmerId;
  const totalBags = gradingTotalBags(gatePass.orderDetails);
  const totalWeightKg = gradingTotalNetProductKg(gatePass.orderDetails);
  const totalGradingBagWeightKg = gradingTotalBagWeightKg(gatePass.orderDetails);
  const incomingGrossKg = gatePass.incomingGatePassIds.reduce((sum, incoming) => {
    const { grossWeightKg } = getIncomingRefWeights(incoming);
    return sum + grossWeightKg;
  }, 0);
  const incomingTareKg = gatePass.incomingGatePassIds.reduce((sum, incoming) => {
    const { tareWeightKg } = getIncomingRefWeights(incoming);
    return sum + tareWeightKg;
  }, 0);
  const incomingWeighbridgeNetKg = incomingGrossKg - incomingTareKg;
  const incomingNetKg = gatePass.incomingGatePassIds.reduce(
    (sum, incoming) => sum + incomingNetProductKg(incoming),
    0,
  );
  const incomingBags = gatePass.incomingGatePassIds.reduce(
    (sum, incoming) => sum + incoming.bagsReceived,
    0,
  );
  const gradingWastageKg = incomingNetKg - totalWeightKg;
  const gradingWastagePercent = incomingNetKg > 0 ? (gradingWastageKg / incomingNetKg) * 100 : 0;
  const incomingCount = gatePass.incomingGatePassIds.length;

  const handleEditClick = () => {
    if (!canUpdate) return;
    navigate({
      to: '/grading/$id',
      params: { id: gatePass._id },
    });
  };

  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-primary" />
              GGP{' '}
              <span className="font-mono tabular-nums text-primary">#{gatePass.gatePassNo}</span>
            </CardTitle>
            {gatePass.manualGatePassNumber != null && (
              <Badge
                variant="outline"
                className="bg-background font-mono text-[10px] tabular-nums uppercase"
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
            className="max-w-36 truncate bg-background text-[11px]"
            title={gatePass.variety}
          >
            {gatePass.variety}
          </Badge>
          <Badge variant="outline" className="bg-background text-[11px] tabular-nums">
            {totalBags.toLocaleString('en-IN')} Bags
          </Badge>
          <Badge variant="secondary" className="text-[11px] tabular-nums">
            {incomingCount} incoming
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <InfoBlock label="Farmer" value={farmer?.name ?? '—'} icon={User} />
          <InfoBlock
            label="Account"
            value={farmerStorageLink?.accountNumber ?? '—'}
            valueClassName="tabular-nums"
          />
          <InfoBlock label="Variety" value={gatePass.variety} icon={Sprout} />
          <InfoBlock
            label="Graded weight"
            value={`${formatKg(totalWeightKg)} kg`}
            icon={Scale}
            valueClassName="tabular-nums"
          />
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Source: Incoming Gate Passes
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <table className="w-full min-w-[820px] caption-bottom text-sm">
                      <thead className="border-b border-border/50 bg-muted/50">
                        <tr>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            IGP #
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Bags
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Gross (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Tare (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Net (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Bardana (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Net Product
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatePass.incomingGatePassIds.map((incoming) => {
                          const { grossWeightKg, tareWeightKg } = getIncomingRefWeights(incoming);
                          const netKg = grossWeightKg - tareWeightKg;
                          const bardanaKg = incoming.bagsReceived * JUTE_BAG_WEIGHT;
                          const netProductKg = incomingNetProductKg(incoming);

                          return (
                            <tr
                              key={incoming.gatePassNo}
                              className="border-b border-border/40 last:border-0"
                            >
                              <td className="px-3 py-2.5 font-mono text-sm font-medium tabular-nums">
                                #{incoming.gatePassNo}
                                {incoming.manualGatePassNumber != null && (
                                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    (M: {incoming.manualGatePassNumber})
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {incoming.bagsReceived.toLocaleString('en-IN')}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {formatKg(grossWeightKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {formatKg(tareWeightKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
                                {formatKg(netKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {formatKg(bardanaKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
                                {formatKg(netProductKg)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-border/60 bg-primary/5">
                        <tr className="font-semibold text-primary">
                          <td className="px-3 py-2.5 text-sm">Totals</td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {incomingBags.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(incomingGrossKg)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(incomingTareKg)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(incomingWeighbridgeNetKg)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(incomingBags * JUTE_BAG_WEIGHT)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(incomingNetKg)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    Graded Output Details
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <table className="w-full min-w-[860px] caption-bottom text-sm">
                      <thead className="border-b border-border/50 bg-muted/50">
                        <tr>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            Size
                          </th>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            Bag type
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Qty
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Wt/bag (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Bag wt (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Deduction (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Net (kg)
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Weight %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatePass.orderDetails.map((row, index) => {
                          const bagWeightKg = getBagWeightKg(row.bagType);
                          const rowBagWeightKg = gradingRowBagWeightKg(row);
                          const rowNetProductKg = gradingRowNetProductKg(row);
                          const rowWeightPercent =
                            totalWeightKg > 0 ? (rowNetProductKg / totalWeightKg) * 100 : 0;

                          return (
                            <tr
                              key={`${row.size}-${index}`}
                              className="border-b border-border/40 last:border-0"
                            >
                              <td className="px-3 py-2.5 font-medium">{row.size}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{row.bagType}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums">
                                {row.quantity.toLocaleString('en-IN')}
                              </td>
                              <td className="px-3 py-2.5 text-right tabular-nums">
                                {formatKg(row.weightPerBagKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right tabular-nums">
                                {formatKg(bagWeightKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right tabular-nums">
                                {formatKg(rowBagWeightKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                                {formatKg(rowNetProductKg)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium tabular-nums text-primary">
                                {formatKg(rowWeightPercent)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-border/60 bg-primary/5">
                        <tr className="font-semibold text-primary">
                          <td className="px-3 py-2.5 text-sm">Totals</td>
                          <td />
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {totalBags.toLocaleString('en-IN')}
                          </td>
                          <td />
                          <td />
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(totalGradingBagWeightKg)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(totalWeightKg)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                            {formatKg(
                              incomingNetKg > 0 ? (totalWeightKg / incomingNetKg) * 100 : 0,
                            )}
                            %
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Scale className="h-4 w-4 text-primary" />
                    Performance metrics
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <InfoBlock
                        label="Total graded weight"
                        value={`${formatKg(totalWeightKg)} kg`}
                        icon={Scale}
                        valueClassName="tabular-nums text-primary"
                      />
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <InfoBlock
                        label="Grading wastage"
                        value={`${formatKg(gradingWastageKg)} kg`}
                        icon={TriangleAlert}
                        valueClassName={cn(
                          'tabular-nums',
                          gradingWastageKg > 0 && 'text-destructive',
                          gradingWastageKg <= 0 && 'text-primary',
                        )}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatKg(gradingWastagePercent)}% of incoming net
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
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

                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      System details
                    </h4>
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <InfoBlock
                        label="Created by"
                        value={gatePass.createdBy.name}
                        icon={ClipboardList}
                      />
                    </div>
                  </div>
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
              <ChevronUp className="mr-2 h-4 w-4" /> View less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> View full details
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

export function GradingGatePassCardSkeleton() {
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
          <Skeleton className="h-6 w-20 rounded-full" />
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
