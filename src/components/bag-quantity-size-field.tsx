import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BAG_SIZES } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
      <Select
        value={value || undefined}
        onValueChange={(next) => onValueChange(next as BagSizeSelectValue)}
      >
        <SelectTrigger
          id={id}
          name={name}
          className="w-full"
          onBlur={onBlur}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {BAG_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
