import * as z from 'zod';

const optionalIndianMobile = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z.union([
      z.literal(''),
      z
        .string()
        .regex(
          /^[6-9]\d{9}$/,
          'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9',
        ),
    ]),
  )
  .transform((value) => (value === '' ? undefined : value));

export const addDispatchLedgerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must not exceed 120 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must not exceed 500 characters'),
  mobileNumber: optionalIndianMobile,
});

export type AddDispatchLedgerFormValues = z.infer<typeof addDispatchLedgerFormSchema>;

export type AddDispatchLedgerFormInput = {
  name: string;
  address: string;
  mobileNumber: string;
};

export type AddDispatchLedgerPayload = {
  name: string;
  address: string;
  mobileNumber?: string;
};

export function buildAddDispatchLedgerPayload(
  values: AddDispatchLedgerFormValues,
): AddDispatchLedgerPayload {
  const payload: AddDispatchLedgerPayload = {
    name: values.name,
    address: values.address,
  };

  if (values.mobileNumber !== undefined) {
    payload.mobileNumber = values.mobileNumber;
  }

  return payload;
}
