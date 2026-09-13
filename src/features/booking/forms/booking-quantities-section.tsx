import { Plus, Trash2 } from 'lucide-react';

import { BagSizeSelectField, FixedBagSizeLabel } from '@/components/bag-quantity-size-field';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ComboboxOption } from '@/components/searchable-option-combobox';
import { getRowRemainingQty } from '@/features/booking/lib/booking-availability';
import { formatBookingBagCount } from '@/features/booking/lib/booking-summary-utils';
import type { CreateBookingFormApi } from '@/features/booking/forms/use-create-booking-form';
import {
  createDefaultBookingQuantities,
  createEmptyBookingQuantityRow,
} from '@/features/booking/schemas/booking-form-schema';
import { POTATO_VARIETY_OPTIONS } from '@/lib/constants';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ensureOptionInList(
  options: ComboboxOption[],
  value: string | undefined,
  label?: string,
): ComboboxOption[] {
  if (!value?.trim()) return options;
  if (options.some((option) => option.id === value)) return options;
  return [...options, { id: value, label: label ?? value }];
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type BookingQuantitiesSectionProps = {
  form: CreateBookingFormApi;
  availabilityMap?: Map<string, number>;
  originalQtyMap?: Map<string, number>;
  isAvailabilityLoading?: boolean;
  isAvailabilityReady?: boolean;
};

export function BookingQuantitiesSection({
  form,
  availabilityMap,
  originalQtyMap,
  isAvailabilityLoading = false,
  isAvailabilityReady = false,
}: BookingQuantitiesSectionProps) {
  const canShowAvailability = isAvailabilityReady && availabilityMap && availabilityMap.size > 0;

  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">Enter Quantities</FieldLegend>
      <FieldDescription>
        Enter variety and quantity for each bag size. Use Add more for an extra size line. Rows with
        zero or empty quantity are ignored on submit.
      </FieldDescription>

      {isAvailabilityLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading availability…</p>
      ) : null}

      <div className="mt-5 rounded-lg border border-border">
        <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 md:grid md:grid-cols-12 md:gap-2">
          <div className="col-span-3 text-sm font-medium text-muted-foreground">Size</div>
          <div className="col-span-4 text-sm font-medium text-muted-foreground">Variety</div>
          <div className="col-span-3 text-right text-sm font-medium text-muted-foreground">
            Quantity
          </div>
          <div className="col-span-2" aria-hidden />
        </div>

        <form.Field name="quantities" mode="array">
          {(field) => {
            const arrayErrors = field.state.meta.errors;
            const arrayErrorMessage =
              arrayErrors.length > 0
                ? typeof arrayErrors[0] === 'string'
                  ? arrayErrors[0]
                  : arrayErrors[0]?.message
                : undefined;
            const quantities = field.state.value;

            return (
              <>
                <div className="divide-y divide-border">
                  {quantities.map((row, index) => {
                    const hasLineSelection =
                      Boolean(row.size.trim()) && Boolean(row.variety.trim());
                    const remaining =
                      canShowAvailability && hasLineSelection
                        ? getRowRemainingQty(quantities, index, availabilityMap, originalQtyMap)
                        : undefined;

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-12 md:items-start md:gap-2 md:py-2.5"
                      >
                        <div className="md:col-span-3">
                          {row.isExtra ? (
                            <form.Field name={`quantities[${index}].size`}>
                              {(subField) => (
                                <BagSizeSelectField
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  rowIndex={index}
                                  labelClassName="md:sr-only"
                                  isInvalid={isFieldInvalid(subField.state.meta)}
                                  errors={subField.state.meta.errors}
                                  onBlur={subField.handleBlur}
                                  onValueChange={subField.handleChange}
                                />
                              )}
                            </form.Field>
                          ) : (
                            <FixedBagSizeLabel size={row.size} rowIndex={index} />
                          )}
                        </div>

                        <div className="md:col-span-4">
                          <form.Field name={`quantities[${index}].variety`}>
                            {(subField) => {
                              const isInvalid = isFieldInvalid(subField.state.meta);
                              const varietyOptions = ensureOptionInList(
                                POTATO_VARIETY_OPTIONS,
                                subField.state.value,
                              );

                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={subField.name} className="md:sr-only">
                                    Variety (row {index + 1})
                                  </FieldLabel>
                                  <Select
                                    value={subField.state.value || undefined}
                                    onValueChange={subField.handleChange}
                                    onOpenChange={(open) => {
                                      if (!open) subField.handleBlur();
                                    }}
                                  >
                                    <SelectTrigger
                                      id={subField.name}
                                      className="w-full"
                                      aria-invalid={isInvalid}
                                    >
                                      <SelectValue placeholder="Select variety" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {varietyOptions.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                          {item.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                                </Field>
                              );
                            }}
                          </form.Field>
                        </div>

                        <div className="md:col-span-3">
                          <form.Field name={`quantities[${index}].qty`}>
                            {(subField) => {
                              const isInvalid = isFieldInvalid(subField.state.meta);
                              const sizeLabel = row.size || `row ${index + 1}`;

                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={subField.name} className="md:sr-only">
                                    Quantity ({sizeLabel})
                                  </FieldLabel>
                                  <Input
                                    {...numericInputProps}
                                    id={subField.name}
                                    name={subField.name}
                                    inputMode="numeric"
                                    placeholder="Qty"
                                    value={subField.state.value ?? ''}
                                    max={remaining !== undefined ? remaining : undefined}
                                    onBlur={subField.handleBlur}
                                    onChange={(e) =>
                                      subField.handleChange(
                                        parseOptionalNonNegativeNumber(e.target.value),
                                      )
                                    }
                                    aria-invalid={isInvalid}
                                    className="text-right tabular-nums"
                                  />
                                  {hasLineSelection && canShowAvailability ? (
                                    <FieldDescription className="text-right tabular-nums">
                                      Available: {formatBookingBagCount(remaining ?? 0)} bags
                                    </FieldDescription>
                                  ) : null}
                                  {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                                </Field>
                              );
                            }}
                          </form.Field>
                        </div>

                        <div className="flex justify-end md:col-span-2">
                          {row.isExtra ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-11 shrink-0 md:size-10"
                              aria-label={`Remove row ${index + 1}`}
                              onClick={() => field.removeValue(index)}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {arrayErrorMessage && (
                  <p className="px-3 pt-3 text-sm text-destructive">{arrayErrorMessage}</p>
                )}

                <div className="flex flex-wrap gap-3 border-t border-border px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => field.pushValue(createEmptyBookingQuantityRow())}
                  >
                    <Plus className="mr-2 size-4" aria-hidden />
                    Add more
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() =>
                      form.setFieldValue('quantities', createDefaultBookingQuantities())
                    }
                  >
                    Clear quantities
                  </Button>
                </div>
              </>
            );
          }}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => state.values.quantities}
        children={(quantities) => {
          const totalBags = quantities.reduce((sum, row) => sum + (row.qty ?? 0), 0);

          return (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
              <span className="text-sm font-semibold text-foreground">Total bags</span>
              <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
                {totalBags.toLocaleString('en-IN')}
              </span>
            </div>
          );
        }}
      />
    </FieldSet>
  );
}
