import { useEffect, useMemo } from 'react';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CreateOutgoingFormApi } from '@/features/outgoing/forms/use-create-outgoing-form';
import { groupOutgoingItemsByVarietyAndSize } from '@/features/outgoing/utils/group-outgoing-items';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { cn } from '@/lib/utils';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalPositiveDecimal(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  step: 'any',
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type OutgoingQuantitiesSectionProps = {
  form: CreateOutgoingFormApi;
  farmerStorageLinkId: string;
  allocations: Record<string, number>;
  onBack: () => void;
};

function ReadOnlyCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Field>
      <FieldLabel className="lg:sr-only">{label}</FieldLabel>
      <div
        className={cn(
          'flex min-h-9 items-center text-sm font-medium text-foreground',
          className,
        )}
        title={value}
      >
        <span className="truncate">{value}</span>
      </div>
    </Field>
  );
}

export function OutgoingQuantitiesSection({
  form,
  farmerStorageLinkId,
  allocations,
  onBack,
}: OutgoingQuantitiesSectionProps) {
  const { data: passes } = useStorageGatePassesForFarmer(farmerStorageLinkId);
  const groups = useMemo(
    () => groupOutgoingItemsByVarietyAndSize(buildTransferItems(allocations, passes)),
    [allocations, passes],
  );
  const groupKeySignature = groups.map((group) => group.key).join('\u001e');

  useEffect(() => {
    const current = form.getFieldValue('step2.weightsBySize') ?? {};
    const groupKeys = groupKeySignature ? groupKeySignature.split('\u001e') : [];
    let changed = false;
    const next = { ...current };

    for (const key of groupKeys) {
      if (!(key in next)) {
        next[key] = undefined;
        changed = true;
      }
    }

    for (const key of Object.keys(next)) {
      if (!groupKeys.includes(key)) {
        delete next[key];
        changed = true;
      }
    }

    if (changed) {
      form.setFieldValue('step2.weightsBySize', next);
    }
  }, [form, groupKeySignature]);

  if (groups.length === 0) {
    return (
      <FieldSet>
        <FieldLegend className="font-heading text-base font-semibold">Enter Quantities</FieldLegend>
        <FieldDescription>
          Select storage gate passes in the previous step to enter average bag weight by variety and
          size.
        </FieldDescription>
        <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No allocations selected</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Go back and choose vouchers and quantities first.
          </p>
          <Button type="button" variant="outline" className="mt-4 h-11" onClick={onBack}>
            Back to details
          </Button>
        </div>
      </FieldSet>
    );
  }

  const totalBags = groups.reduce((sum, group) => sum + group.quantity, 0);
  const showVariety = new Set(groups.map((group) => group.variety)).size > 1;

  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">Enter Quantities</FieldLegend>
      <FieldDescription>
        Bag counts come from the vouchers you selected. Enter the average bag weight once per variety
        and size; it is applied to every matching gate pass.
      </FieldDescription>

      <div className="mt-5 rounded-lg border border-border">
        <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 lg:grid lg:grid-cols-12 lg:gap-2">
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Size</div>
          <div className="col-span-1 text-sm font-medium text-muted-foreground">Qty</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Bag type</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Chamber</div>
          <div className="col-span-1 text-sm font-medium text-muted-foreground">Floor</div>
          <div className="col-span-1 text-sm font-medium text-muted-foreground">Row</div>
          <div className="col-span-3 text-sm font-medium text-muted-foreground">Weight (kg)</div>
        </div>

        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div
              key={group.key}
              className="grid grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-12 lg:items-start lg:gap-2 lg:py-2.5"
            >
              <div className="lg:col-span-2">
                <ReadOnlyCell
                  label="Size"
                  value={showVariety ? `${group.variety} · ${group.size}` : group.size}
                />
              </div>
              <div className="lg:col-span-1">
                <ReadOnlyCell
                  label={`Qty (${group.size})`}
                  value={group.quantity.toLocaleString('en-IN')}
                  className="tabular-nums"
                />
              </div>
              <div className="lg:col-span-2">
                <ReadOnlyCell label={`Bag type (${group.size})`} value={group.bagType} />
              </div>
              <div className="lg:col-span-2">
                <ReadOnlyCell label={`Chamber (${group.size})`} value={group.chamber} />
              </div>
              <div className="lg:col-span-1">
                <ReadOnlyCell label={`Floor (${group.size})`} value={group.floor} />
              </div>
              <div className="lg:col-span-1">
                <ReadOnlyCell label={`Row (${group.size})`} value={group.row} />
              </div>
              <div className="lg:col-span-3">
                <form.Field
                  name={`step2.weightsBySize.${group.key}`}
                  validators={{
                    onChange: ({ value }) =>
                      value == null || value <= 0
                        ? { message: 'Enter average weight in kg' }
                        : undefined,
                  }}
                >
                  {(subField) => {
                    const isInvalid = isFieldInvalid(subField.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={subField.name} className="lg:sr-only">
                          Weight in kg ({group.size})
                        </FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={subField.name}
                          name={subField.name}
                          inputMode="decimal"
                          placeholder="kg"
                          value={subField.state.value ?? ''}
                          onBlur={subField.handleBlur}
                          onChange={(e) =>
                            subField.handleChange(parseOptionalPositiveDecimal(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          className="tabular-nums"
                        />
                        {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
        <span className="text-sm font-semibold text-foreground">Total bags</span>
        <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
          {totalBags.toLocaleString('en-IN')}
        </span>
      </div>
    </FieldSet>
  );
}
