import { useMemo } from 'react';
import { DatePickerInput } from '@/components/date-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { BagSizeSelectField, FixedBagSizeLabel } from '@/components/bag-quantity-size-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IncomingGatePassesSummaryCard } from '@/features/grading/components/incoming-gate-passes-summary-card';
import { resolveSelectedIncomingGatePasses } from '@/features/grading/utils/resolve-selected-incoming-gate-passes';
import type { GradingFormApi } from '@/features/grading/forms/use-grading-form';
import { useIncomingGatePassesByFarmer } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer';
import {
  createDefaultQuantities,
  createEmptyQuantityRow,
  gradingTotalWeightKg,
} from '@/features/grading/schemas/grading-fill-details-schema';
import { BAG_TYPES } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type FillDetailsStepProps = {
  form: GradingFormApi;
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
};

type SelectedGatePassesSummaryProps = {
  farmerStorageLinkId: string;
  selectedIncomingGatePassIds: string[];
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
};

function SelectedGatePassesSummary({
  farmerStorageLinkId,
  selectedIncomingGatePassIds,
  linkedGatePasses = [],
}: SelectedGatePassesSummaryProps) {
  const { data: gatePassResult } = useIncomingGatePassesByFarmer(farmerStorageLinkId);

  const selectedGatePasses = useMemo(
    () =>
      resolveSelectedIncomingGatePasses(selectedIncomingGatePassIds, [
        ...(gatePassResult?.incomingGatePasses ?? []),
        ...linkedGatePasses,
      ]),
    [gatePassResult?.incomingGatePasses, linkedGatePasses, selectedIncomingGatePassIds],
  );

  return <IncomingGatePassesSummaryCard className="mt-4" gatePasses={selectedGatePasses} />;
}

export function FillDetailsStep({ form, linkedGatePasses }: FillDetailsStepProps) {
  return (
    <FieldGroup className="@container/field-group gap-10">
      <FieldSet>
        <FieldLegend className="text-lg font-semibold">General Information</FieldLegend>
        <FieldDescription>Basic details regarding the transport and timing.</FieldDescription>
        <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
          <form.Field name="manualGatePassNumber">
            {(field) => {
              const isInvalid = isFieldInvalid(field.state.meta);
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Manual Gate Pass No.</FieldLabel>
                  <Input
                    {...numericInputProps}
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseOptionalNonNegativeNumber(e.target.value))
                    }
                    aria-invalid={isInvalid}
                    placeholder="e.g. 1024 (optional)"
                  />
                  <FieldDescription>
                    Leave blank if no manual slip number was issued.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="date">
            {(field) => {
              const isInvalid = isFieldInvalid(field.state.meta);
              return (
                <Field data-invalid={isInvalid}>
                  <DatePickerInput
                    id={field.name}
                    label="Date"
                    value={field.state.value ? new Date(field.state.value) : undefined}
                    onChange={(date) => field.handleChange(date ? date.toISOString() : '')}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="Pick a date"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend className="font-heading text-lg font-semibold">Enter Quantities</FieldLegend>
        <FieldDescription>
          Enter bag counts by size. Use Add more for another row with the same size but a different
          bag type or weight. Rows with zero or empty quantity are ignored on submit.
        </FieldDescription>

        <form.Subscribe
          selector={(state) => ({
            farmerStorageLinkId: state.values.farmerStorageLinkId,
            selectedIncomingGatePassIds: state.values.selectedIncomingGatePassIds,
          })}
          children={({ farmerStorageLinkId, selectedIncomingGatePassIds }) => (
            <SelectedGatePassesSummary
              farmerStorageLinkId={farmerStorageLinkId}
              selectedIncomingGatePassIds={selectedIncomingGatePassIds}
              linkedGatePasses={linkedGatePasses}
            />
          )}
        />

        <div className="mt-5 rounded-lg border border-border">
          <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 md:grid md:grid-cols-12 md:gap-3">
            <div className="col-span-3 text-sm font-medium text-muted-foreground">Size</div>
            <div className="col-span-2 text-sm font-medium text-muted-foreground">Qty</div>
            <div className="col-span-3 text-sm font-medium text-muted-foreground">Bag type</div>
            <div className="col-span-3 text-right text-sm font-medium text-muted-foreground">
              wt (kg)/bag
            </div>
            <div className="col-span-1" aria-hidden />
          </div>

          <form.Field name="quantities" mode="array">
            {(field) => (
              <>
                <div className="divide-y divide-border">
                  {field.state.value.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-12 md:items-start md:gap-3 md:py-2.5"
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

                      <div className="md:col-span-2">
                        <form.Field name={`quantities[${index}].qty`}>
                          {(subField) => {
                            const isInvalid = isFieldInvalid(subField.state.meta);
                            const sizeLabel = row.size || `row ${index + 1}`;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name} className="md:sr-only">
                                  Qty ({sizeLabel})
                                </FieldLabel>
                                <Input
                                  {...numericInputProps}
                                  id={subField.name}
                                  name={subField.name}
                                  inputMode="numeric"
                                  placeholder="Qty"
                                  value={subField.state.value ?? ''}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      parseOptionalNonNegativeNumber(e.target.value),
                                    )
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

                      <div className="md:col-span-3">
                        <form.Field name={`quantities[${index}].bagType`}>
                          {(subField) => {
                            const isInvalid = isFieldInvalid(subField.state.meta);
                            const sizeLabel = row.size || `row ${index + 1}`;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name} className="md:sr-only">
                                  Bag type ({sizeLabel})
                                </FieldLabel>
                                <Select
                                  value={subField.state.value}
                                  onValueChange={subField.handleChange}
                                >
                                  <SelectTrigger
                                    id={subField.name}
                                    className="w-full"
                                    onBlur={subField.handleBlur}
                                    aria-invalid={isInvalid}
                                  >
                                    <SelectValue placeholder="Bag type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BAG_TYPES.map((bagType) => (
                                      <SelectItem key={bagType} value={bagType}>
                                        {bagType}
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

                      <div className="flex gap-2 md:col-span-3 md:gap-0">
                        <div className="min-w-0 flex-1">
                          <form.Field name={`quantities[${index}].weight`}>
                            {(subField) => {
                              const isInvalid = isFieldInvalid(subField.state.meta);
                              const sizeLabel = row.size || `row ${index + 1}`;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={subField.name} className="md:sr-only">
                                    Weight kg per bag ({sizeLabel})
                                  </FieldLabel>
                                  <Input
                                    {...numericInputProps}
                                    id={subField.name}
                                    name={subField.name}
                                    inputMode="decimal"
                                    step="0.01"
                                    placeholder="kg/bag"
                                    value={subField.state.value ?? ''}
                                    onBlur={subField.handleBlur}
                                    onChange={(e) =>
                                      subField.handleChange(
                                        parseOptionalNonNegativeNumber(e.target.value),
                                      )
                                    }
                                    aria-invalid={isInvalid}
                                    className="tabular-nums md:text-right"
                                  />
                                  {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                                </Field>
                              );
                            }}
                          </form.Field>
                        </div>

                        {row.isExtra && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 shrink-0 md:hidden"
                            aria-label={`Remove row ${index + 1}`}
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        )}
                      </div>

                      <div className="hidden justify-end md:col-span-1 md:flex">
                        {row.isExtra ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-10"
                            aria-label={`Remove row ${index + 1}`}
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 border-t border-border px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => field.pushValue(createEmptyQuantityRow())}
                  >
                    <Plus className="mr-2 size-4" aria-hidden />
                    Add more
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => form.setFieldValue('quantities', createDefaultQuantities())}
                  >
                    Clear quantities
                  </Button>
                </div>
              </>
            )}
          </form.Field>
        </div>

        <FieldDescription className="mt-4">
          Quantity and weight per bag (kg) by size.
        </FieldDescription>

        <form.Subscribe
          selector={(state) => state.values.quantities}
          children={(quantities) => {
            const totalBags = quantities.reduce((sum, row) => sum + (row.qty ?? 0), 0);
            const totalWeightKg = gradingTotalWeightKg(quantities);
            const weightFormatter = new Intl.NumberFormat('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
                  <span className="text-sm font-semibold text-foreground">Total bags</span>
                  <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
                    {totalBags}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
                  <span className="text-sm font-semibold text-foreground">Total weight</span>
                  <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
                    {weightFormatter.format(totalWeightKg)}
                    <span className="ml-1.5 text-base font-sans font-medium text-muted-foreground">
                      kg
                    </span>
                  </span>
                </div>
              </div>
            );
          }}
        />
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend className="text-lg font-semibold">Additional Notes</FieldLegend>
        <FieldGroup className="mt-5">
          <form.Field name="remarks">
            {(field) => {
              const isInvalid = isFieldInvalid(field.state.meta);
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Remarks
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Add any additional comments or observations (Optional)"
                    className="min-h-[120px] resize-y"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
