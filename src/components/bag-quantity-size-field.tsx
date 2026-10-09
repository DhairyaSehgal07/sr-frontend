import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { ManagedSearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { BAG_SIZES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const BAG_SIZE_OPTIONS = BAG_SIZES.map((size) => ({
  id: size,
  label: size,
}));

export type BagSizeSelectValue = (typeof BAG_SIZES)[number] | '';

type FixedBagSizeLabelProps = {
  size: string;
  rowIndex: number;
};

/** Default bag-size rows: fixed label, order from BAG_SIZES. */
export function FixedBagSizeLabel({ size, rowIndex }: FixedBagSizeLabelProps) {
  return (
    <div
      className="flex min-h-11 items-center md:min-h-10"
      aria-label={`Size (row ${rowIndex + 1}): ${size}`}
    >
      <span className="text-sm font-medium text-foreground">{size}</span>
    </div>
  );
}

type BagSizeSelectFieldProps = {
  id: string;
  name: string;
  value: string;
  rowIndex: number;
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  labelClassName?: string;
  onBlur: () => void;
  onValueChange: (value: BagSizeSelectValue) => void;
};

/** Extra quantity rows only: pick which bag size to add. */
export function BagSizeSelectField({
  id,
  name,
  value,
  rowIndex,
  isInvalid,
  errors,
  labelClassName = 'md:sr-only',
  onBlur,
  onValueChange,
}: BagSizeSelectFieldProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id} className={cn(labelClassName)}>
        Size (row {rowIndex + 1})
      </FieldLabel>
      <ManagedSearchableOptionCombobox
        id={id}
        name={name}
        value={value}
        onValueChange={(next) => onValueChange(next as BagSizeSelectValue)}
        onBlur={onBlur}
        isInvalid={isInvalid}
        placeholder="Select size"
        emptyMessage="No sizes found."
        options={BAG_SIZE_OPTIONS}
      />
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
