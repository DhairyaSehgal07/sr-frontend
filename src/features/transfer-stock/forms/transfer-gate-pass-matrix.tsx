import { Fragment, useCallback, useState } from 'react';
import { ClipboardList, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TransferAllocationSheet,
  type AllocationSheetTarget,
} from '@/features/transfer-stock/forms/transfer-allocation-sheet';
import type {
  DatePassGroup,
  StorageGatePass,
} from '@/features/transfer-stock/types/storage-gate-pass';
import {
  allocationKey,
  formatLocationShort,
  getBagSlotsForSize,
  type BagSlotDetail,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { cn } from '@/lib/utils';

/** Checkbox + R. Voucher columns before size lanes. */
const FIXED_COLUMN_COUNT = 2;

function sizeLaneIndex(columnIndex: number) {
  return columnIndex - FIXED_COLUMN_COUNT;
}

function sizeLaneClasses(columnIndex: number, variant: 'head' | 'cell') {
  const lane = sizeLaneIndex(columnIndex);
  return cn(
    'border-l-2 border-border px-4',
    variant === 'head'
      ? cn('bg-muted/50 text-center', lane % 2 === 1 && 'bg-muted/65')
      : lane % 2 === 0
        ? 'bg-muted/20'
        : 'bg-muted/35',
  );
}

function stickyCheckboxHeadClass() {
  return 'sticky left-0 z-20 w-12 bg-muted/50 px-2';
}

function stickyVoucherHeadClass() {
  return 'sticky left-12 z-20 min-w-[5.5rem] border-r border-border bg-muted/50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]';
}

function stickyCheckboxCellClass() {
  return 'sticky left-0 z-10 bg-background even:bg-muted/15';
}

function stickyVoucherCellClass() {
  return 'sticky left-12 z-10 min-w-[5.5rem] border-r border-border bg-background shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] even:bg-muted/15';
}

function EmptySeat() {
  return (
    <Button
      type="button"
      variant="outline"
      disabled
      tabIndex={-1}
      className="h-11 min-w-[7.5rem] border-dashed opacity-100"
      aria-hidden
    />
  );
}

function SelectedQuantityBadge({ quantity }: { quantity: number }) {
  return (
    <Badge
      className="pointer-events-none absolute top-0 right-0 z-10 h-5 min-w-7 -translate-y-1/2 translate-x-1/2 border border-background px-1.5 tabular-nums shadow-sm"
      aria-hidden
    >
      {quantity.toLocaleString('en-IN')}
    </Badge>
  );
}

function SlotButton({
  pass,
  sizeName,
  slot,
  selectedQty,
  onClick,
}: {
  pass: StorageGatePass;
  sizeName: string;
  slot: BagSlotDetail;
  selectedQty: number;
  onClick: () => void;
}) {
  const isSelected = selectedQty > 0;
  const available = slot.currentQuantity;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'relative h-auto min-h-11 min-w-[7.5rem] flex-col items-stretch justify-start gap-0.5 rounded-md px-2 py-1.5 text-left font-normal',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/30 hover:bg-primary/5',
      )}
      aria-label={`${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, ${isSelected ? `${selectedQty} of ${available} selected` : `${available} available`}`}
    >
      {isSelected ? <SelectedQuantityBadge quantity={selectedQty} /> : null}
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <MapPin className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{formatLocationShort(slot)}</span>
      </span>
      <span className="w-full text-right text-sm font-medium tabular-nums text-foreground">
        {available.toLocaleString('en-IN')}
      </span>
    </Button>
  );
}

function GatePassSizeCell({
  pass,
  sizeName,
  allocations,
  onSlotClick,
}: {
  pass: StorageGatePass;
  sizeName: string;
  allocations: Record<string, number>;
  onSlotClick: (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => void;
}) {
  const slots = getBagSlotsForSize(pass, sizeName);

  if (slots.length === 0) {
    return <EmptySeat />;
  }

  return (
    <div className="flex min-w-[7.5rem] flex-col gap-2 overflow-visible pt-1">
      {slots.map((slot) => {
        const key = allocationKey(pass._id, sizeName, slot.bagIndex);
        const selectedQty = allocations[key] ?? 0;
        return (
          <SlotButton
            key={key}
            pass={pass}
            sizeName={sizeName}
            slot={slot}
            selectedQty={selectedQty}
            onClick={() => onSlotClick(pass, sizeName, slot)}
          />
        );
      })}
    </div>
  );
}

type TransferGatePassMatrixProps = {
  displayGroups: DatePassGroup[];
  visibleSizes: string[];
  selectedPassIds: Set<string>;
  onPassToggle: (passId: string) => void;
  allocations: Record<string, number>;
  onAllocationChange: (key: string, quantity: number) => void;
  onAllocationClear: (key: string) => void;
  hasFilteredData?: boolean;
  hasActiveFilters?: boolean;
};

export function TransferGatePassMatrix({
  displayGroups,
  visibleSizes,
  selectedPassIds,
  onPassToggle,
  allocations,
  onAllocationChange,
  onAllocationClear,
  hasFilteredData = true,
  hasActiveFilters = false,
}: TransferGatePassMatrixProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<AllocationSheetTarget | null>(null);

  const columnCount = FIXED_COLUMN_COUNT + visibleSizes.length;

  const handleSlotClick = useCallback(
    (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => {
      const key = allocationKey(pass._id, sizeName, slot.bagIndex);
      setSheetTarget({
        pass,
        sizeName,
        slot,
        allocationKey: key,
        currentQuantity: slot.currentQuantity,
      });
      setSheetOpen(true);
    },
    [],
  );

  const sheetInitialQty = sheetTarget ? (allocations[sheetTarget.allocationKey] ?? 0) : 0;

  if (!hasFilteredData) {
    return (
      <Card size="sm" className="overflow-hidden py-0 shadow-sm ring-border/60">
        <CardContent className="px-0 py-0">
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters ? 'No matching gate passes' : 'No gate passes to show'}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? 'Try different filters or clear the search.'
                  : 'Choose a variety to display gate passes, or check back when stock is available.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card size="sm" className="overflow-hidden py-0 shadow-sm ring-border/60">
        <CardContent className="overflow-x-auto px-0 py-0">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 z-10 bg-muted/50 [&_tr]:border-b [&_tr]:hover:bg-transparent">
              <TableRow>
                <TableHead
                  className={cn('h-10 px-3 text-muted-foreground', stickyCheckboxHeadClass())}
                >
                  <span className="sr-only">Select voucher</span>
                </TableHead>
                <TableHead
                  className={cn('h-10 px-3 text-muted-foreground', stickyVoucherHeadClass())}
                >
                  <span className="text-xs font-medium text-muted-foreground">R. Voucher</span>
                </TableHead>
                {visibleSizes.map((sizeName, index) => (
                  <TableHead
                    key={sizeName}
                    className={cn(
                      'h-10 px-3 text-muted-foreground',
                      sizeLaneClasses(FIXED_COLUMN_COUNT + index, 'head'),
                    )}
                  >
                    <span className="block w-full whitespace-nowrap text-center text-sm font-semibold text-foreground">
                      {sizeName}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayGroups.map((group) => (
                <Fragment key={group.dateKey}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="bg-muted/30 px-3 py-2">
                      <span className="font-heading text-sm font-semibold text-primary">
                        {group.dateLabel}
                      </span>
                    </TableCell>
                  </TableRow>
                  {group.passes.map((pass) => (
                    <TableRow
                      key={pass._id}
                      className="even:bg-muted/15"
                      data-selected={selectedPassIds.has(pass._id) || undefined}
                    >
                      <TableCell
                        className={cn(
                          'overflow-visible px-3 py-2.5 align-top',
                          stickyCheckboxCellClass(),
                        )}
                      >
                        <Checkbox
                          checked={selectedPassIds.has(pass._id)}
                          onCheckedChange={() => onPassToggle(pass._id)}
                          aria-label={`Select gate pass ${pass.gatePassNo}`}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          'overflow-visible px-3 py-2.5 align-top',
                          stickyVoucherCellClass(),
                        )}
                      >
                        <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                          #{pass.gatePassNo}
                        </span>
                      </TableCell>
                      {visibleSizes.map((sizeName, index) => (
                        <TableCell
                          key={sizeName}
                          className={cn(
                            'overflow-visible py-2.5 align-top',
                            sizeLaneClasses(FIXED_COLUMN_COUNT + index, 'cell'),
                          )}
                        >
                          <GatePassSizeCell
                            pass={pass}
                            sizeName={sizeName}
                            allocations={allocations}
                            onSlotClick={handleSlotClick}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransferAllocationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        target={sheetTarget}
        initialQuantity={sheetInitialQty}
        onApply={onAllocationChange}
        onClear={onAllocationClear}
      />
    </>
  );
}
