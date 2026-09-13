import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
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
import type { CreateStorageFormApi } from '@/features/storage/forms/use-create-storage-form';
import {
  createDefaultStorageQuantities,
  createEmptyStorageQuantityRow,
} from '@/features/storage/schemas/storage-quantities-schema';
import {
  BAG_TYPES,
  DEFAULT_CHAMBER,
  DEFAULT_FLOOR,
  DEFAULT_STORAGE_ROW,
  type BagType,
} from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';

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

type StorageQuantitiesSectionProps = {
  form: CreateStorageFormApi;
};

export function StorageQuantitiesSection({ form }: StorageQuantitiesSectionProps) {
  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">Enter Quantities</FieldLegend>
      <FieldDescription>
        Enter bag counts by size and assign chamber, floor, and row for each line. Use Add more for
        another row with the same size but different bag type or location. Rows with zero or empty
        quantity are ignored on submit.
      </FieldDescription>

      <div className="mt-5 rounded-lg border border-border">
        <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 lg:grid lg:grid-cols-12 lg:gap-2">
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Size</div>
          <div className="col-span-1 text-sm font-medium text-muted-foreground">Qty</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Bag type</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Chamber</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Floor</div>
          <div className="col-span-2 text-sm font-medium text-muted-foreground">Row</div>
          <div className="col-span-1" aria-hidden />
        </div>

        <form.Field name="quantities" mode="array">
          {(field) => (
            <>
              <div className="divide-y divide-border">
                {field.state.value.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-12 lg:items-start lg:gap-2 lg:py-2.5"
                  >
                    <div className="lg:col-span-2">
                      {row.isExtra ? (
                        <form.Field name={`quantities[${index}].size`}>
                          {(subField) => (
                            <BagSizeSelectField
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              rowIndex={index}
                              labelClassName="lg:sr-only"
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

                    <div className="lg:col-span-1">
                      <form.Field name={`quantities[${index}].qty`}>
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="lg:sr-only">
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

                    <div className="lg:col-span-2">
                      <form.Field name={`quantities[${index}].bagType`}>
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="lg:sr-only">
                                Bag type ({sizeLabel})
                              </FieldLabel>
                              <Select
                                value={subField.state.value}
                                onValueChange={(value) => subField.handleChange(value as BagType)}
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

                    <div className="lg:col-span-2">
                      <form.Field name={`quantities[${index}].chamber`}>
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="lg:sr-only">
                                Chamber ({sizeLabel})
                              </FieldLabel>
                              <Input
                                id={subField.name}
                                name={subField.name}
                                value={subField.state.value}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                                aria-invalid={isInvalid}
                                placeholder={`e.g. ${DEFAULT_CHAMBER}`}
                                autoComplete="off"
                              />
                              {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    <div className="lg:col-span-2">
                      <form.Field name={`quantities[${index}].floor`}>
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="lg:sr-only">
                                Floor ({sizeLabel})
                              </FieldLabel>
                              <Input
                                id={subField.name}
                                name={subField.name}
                                value={subField.state.value}
                                onBlur={subField.handleBlur}
                                onChange={(e) => subField.handleChange(e.target.value)}
                                aria-invalid={isInvalid}
                                placeholder={`e.g. ${DEFAULT_FLOOR}`}
                                autoComplete="off"
                              />
                              {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    <div className="flex gap-2 lg:col-span-2 lg:gap-0">
                      <div className="min-w-0 flex-1">
                        <form.Field name={`quantities[${index}].row`}>
                          {(subField) => {
                            const isInvalid = isFieldInvalid(subField.state.meta);
                            const sizeLabel = row.size || `row ${index + 1}`;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name} className="lg:sr-only">
                                  Row ({sizeLabel})
                                </FieldLabel>
                                <Input
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  aria-invalid={isInvalid}
                                  placeholder={`e.g. ${DEFAULT_STORAGE_ROW}`}
                                  autoComplete="off"
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
                          className="size-11 shrink-0 lg:hidden"
                          aria-label={`Remove row ${index + 1}`}
                          onClick={() => field.removeValue(index)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      )}
                    </div>

                    <div className="hidden justify-end lg:col-span-1 lg:flex">
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
                  onClick={() => field.pushValue(createEmptyStorageQuantityRow())}
                >
                  <Plus className="mr-2 size-4" aria-hidden />
                  Add more
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => form.setFieldValue('quantities', createDefaultStorageQuantities())}
                >
                  Clear quantities
                </Button>
              </div>
            </>
          )}
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
