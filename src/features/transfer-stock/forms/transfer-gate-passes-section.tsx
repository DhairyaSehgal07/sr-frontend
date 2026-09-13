import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Columns, MapPin, Package, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TransferGatePassMatrix } from '@/features/transfer-stock/forms/transfer-gate-pass-matrix';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { useTransferGatePassMatrix } from '@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix';
import { cn } from '@/lib/utils';

type TransferGatePassesSectionProps = {
  fromFarmerStorageLinkId: string;
  allocations: Record<string, number>;
  onAllocationsChange: (next: Record<string, number>) => void;
  /** Label used in empty state, e.g. "From" (transfer) or "a farmer" (outgoing). */
  farmerPromptLabel?: string;
};

export function TransferGatePassesSection({
  fromFarmerStorageLinkId,
  allocations,
  onAllocationsChange,
  farmerPromptLabel = 'From',
}: TransferGatePassesSectionProps) {
  const {
    data: allPasses,
    isLoading,
    error,
  } = useStorageGatePassesForFarmer(fromFarmerStorageLinkId);

  const matrix = useTransferGatePassMatrix({
    allPasses,
    allocations,
    onAllocationsChange,
  });

  if (!fromFarmerStorageLinkId) {
    return (
      <GatePassesSectionMessage
        title="Select a farmer"
        description={
          farmerPromptLabel === 'From' ? (
            <>
              Choose a <span className="font-medium text-foreground">From</span> farmer to view
              storage gate passes.
            </>
          ) : (
            <>
              Choose a <span className="font-medium text-foreground">farmer</span> to view storage
              gate passes.
            </>
          )
        }
      />
    );
  }

  if (isLoading) {
    return (
      <Card size="sm" className="py-4 ring-border/60">
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <GatePassesSectionMessage
        title="Could not load gate passes"
        description={error.message}
        variant="destructive"
      />
    );
  }

  if (!allPasses.length) {
    return (
      <GatePassesSectionMessage
        title="No gate passes"
        description="No storage gate passes for this farmer."
      />
    );
  }

  return (
    <div className="space-y-4">
      <InputGroup className="h-11">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search by gate pass or manual parchi number"
          value={matrix.gatePassSearch}
          onChange={(e) => matrix.setGatePassSearch(e.target.value)}
          className="text-base sm:text-sm"
          aria-label="Search gate passes"
        />
      </InputGroup>

      <Card size="sm" className="bg-muted/30 py-4 ring-border/60">
        <CardContent className="flex flex-wrap items-end gap-x-5 gap-y-4 px-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium leading-none text-muted-foreground">
              Sort by gate pass
            </Label>
            <div className="flex h-10 items-center gap-1.5">
              <Button
                type="button"
                variant={matrix.voucherSort === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="h-10 gap-1.5 px-3"
                onClick={() => matrix.setVoucherSort('asc')}
              >
                <ArrowUp className="size-4" />
                Ascending
              </Button>
              <Button
                type="button"
                variant={matrix.voucherSort === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="h-10 gap-1.5 px-3"
                onClick={() => matrix.setVoucherSort('desc')}
              >
                <ArrowDown className="size-4" />
                Descending
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium leading-none text-muted-foreground">Sizes</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-10 gap-2">
                  <Columns className="size-4" />
                  Sizes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle sizes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={matrix.sizeVisibility === 'all'}
                  onCheckedChange={(checked) => {
                    if (checked) matrix.handleSelectAllSizes();
                    else matrix.setSizeVisibility(new Set());
                  }}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {matrix.sizesForColumnPicker.map((size) => (
                  <DropdownMenuCheckboxItem
                    key={size}
                    checked={matrix.isSizeVisible(matrix.sizeVisibility, size)}
                    onCheckedChange={() => matrix.handleSizeToggle(size)}
                  >
                    {size}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {matrix.uniqueVarieties.length > 0 && (
            <div
              className={cn(
                'flex flex-col gap-2 rounded-lg transition-[box-shadow,background-color,border-color]',
                matrix.needsVarietySelection &&
                  'border-2 border-primary/50 bg-primary/5 p-2.5 shadow-sm ring-2 ring-primary/25',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <Label
                  className={cn(
                    'text-xs font-medium leading-none',
                    matrix.needsVarietySelection ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  Variety
                  {matrix.needsVarietySelection ? (
                    <span className="ml-0.5 font-semibold text-destructive">*</span>
                  ) : null}
                </Label>
                {matrix.needsVarietySelection ? (
                  <p className="max-w-52 text-xs leading-snug text-muted-foreground">
                    Choose a variety to show gate passes below.
                  </p>
                ) : null}
              </div>
              <MatrixRadioFilter
                value={matrix.varietyFilter}
                options={matrix.uniqueVarieties}
                onChange={matrix.setVarietyFilter}
                icon={Package}
                triggerClassName={cn(
                  'min-w-[120px]',
                  matrix.needsVarietySelection &&
                    'border-primary/60 bg-background text-primary hover:bg-primary/10',
                )}
                ariaLabel={matrix.needsVarietySelection ? 'Variety — required' : 'Variety filter'}
              />
            </div>
          )}

          {matrix.uniqueLocations.chambers.length > 0 && (
            <MatrixRadioFilter
              label="Chamber"
              value={matrix.locationFilters.chamber}
              options={matrix.uniqueLocations.chambers}
              onChange={(chamber) => matrix.setLocationFilters((prev) => ({ ...prev, chamber }))}
              icon={MapPin}
            />
          )}
          {matrix.uniqueLocations.floors.length > 0 && (
            <MatrixRadioFilter
              label="Floor"
              value={matrix.locationFilters.floor}
              options={matrix.uniqueLocations.floors}
              onChange={(floor) => matrix.setLocationFilters((prev) => ({ ...prev, floor }))}
              icon={MapPin}
            />
          )}
          {matrix.uniqueLocations.rows.length > 0 && (
            <MatrixRadioFilter
              label="Row"
              value={matrix.locationFilters.row}
              options={matrix.uniqueLocations.rows}
              onChange={(row) => matrix.setLocationFilters((prev) => ({ ...prev, row }))}
              icon={MapPin}
            />
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium leading-none text-muted-foreground">Reset</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-2"
              onClick={matrix.handleResetFilters}
            >
              <RotateCcw className="size-4" />
              Reset filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <TransferGatePassMatrix
        displayGroups={matrix.displayGroups}
        visibleSizes={matrix.visibleSizes}
        selectedPassIds={matrix.selectedPassIds}
        onPassToggle={matrix.handlePassToggle}
        allocations={allocations}
        onAllocationChange={matrix.handleAllocationChange}
        onAllocationClear={matrix.handleAllocationClear}
        hasFilteredData={matrix.hasFilteredData}
        hasActiveFilters={matrix.hasActiveFilters}
      />
    </div>
  );
}

function GatePassesSectionMessage({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description: ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Card size="sm" className="py-0 ring-border/60">
      <CardContent className="px-0 py-0">
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyTitle className={variant === 'destructive' ? 'text-destructive' : undefined}>
              {title}
            </EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}

function MatrixRadioFilter({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  triggerClassName,
  ariaLabel,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
  triggerClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <Label className="text-xs font-medium leading-none text-muted-foreground">{label}</Label>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('h-10 min-w-[100px] justify-between gap-2', triggerClassName)}
            aria-label={ariaLabel ?? `${label} filter`}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {value || 'All'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v ?? '')}>
            <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
            {options.map((opt) => (
              <DropdownMenuRadioItem key={opt} value={opt}>
                {opt}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
