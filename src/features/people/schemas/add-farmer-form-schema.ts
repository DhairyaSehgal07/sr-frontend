import * as z from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number');

const optionalAadhar = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.union([z.literal(''), z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits')]))
  .transform((value) => (value === '' ? undefined : value));

const optionalPan = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .pipe(
    z.union([
      z.literal(''),
      z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Enter a valid PAN (e.g. ABCDE1234F)'),
    ]),
  )
  .transform((value) => (value === '' ? undefined : value));

const optionalUrl = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.union([z.literal(''), z.string().url('Enter a valid image URL')]))
  .transform((value) => (value === '' ? undefined : value));

const optionalPositiveNumber = z.union([
  z.undefined(),
  z.number().positive('Cost per bag must be greater than zero'),
]);

type CreateAddFarmerFormSchemaOptions = {
  getUsedAccountNumbers: () => number[];
  getUsedMobileNumbers: () => string[];
};

export function createAddFarmerFormSchema({
  getUsedAccountNumbers,
  getUsedMobileNumbers,
}: CreateAddFarmerFormSchemaOptions) {
  return z.object({
    name: z.string().trim().min(1, 'Name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    mobileNumber: indianMobile.refine((value) => !getUsedMobileNumbers().includes(value), {
      message: 'Mobile number already in use',
    }),
    accountNumber: z
      .string()
      .transform((value) => (value === '' || Number.isNaN(Number(value)) ? '' : value))
      .pipe(
        z
          .string()
          .min(1, 'Account number is required')
          .refine((value) => {
            const num = Number(value);
            return !Number.isNaN(num) && num > 0 && Number.isInteger(num);
          }, 'Account number is required')
          .refine((value) => !getUsedAccountNumbers().includes(Number(value)), {
            message: 'This account number is already taken',
          }),
      )
      .transform((value) => Number(value)),
    aadharCardNumber: optionalAadhar,
    panCardNumber: optionalPan,
    imageUrl: optionalUrl,
    costPerBag: optionalPositiveNumber,
  });
}

export type AddFarmerFormValues = z.infer<ReturnType<typeof createAddFarmerFormSchema>>;

/** API payload — optional fields are omitted when not provided. */
export type AddFarmerPayload = {
  name: string;
  address: string;
  mobileNumber: string;
  accountNumber: number;
  aadharCardNumber?: string;
  panCardNumber?: string;
  imageUrl?: string;
  costPerBag?: number;
};

export function buildAddFarmerPayload(values: AddFarmerFormValues): AddFarmerPayload {
  const payload: AddFarmerPayload = {
    name: values.name,
    address: values.address,
    mobileNumber: values.mobileNumber,
    accountNumber: values.accountNumber,
  };

  if (values.aadharCardNumber !== undefined) {
    payload.aadharCardNumber = values.aadharCardNumber;
  }
  if (values.panCardNumber !== undefined) {
    payload.panCardNumber = values.panCardNumber;
  }
  if (values.imageUrl !== undefined) {
    payload.imageUrl = values.imageUrl;
  }
  if (values.costPerBag !== undefined) {
    payload.costPerBag = values.costPerBag;
  }

  return payload;
}

export type AddFarmerFormInput = {
  name: string;
  address: string;
  mobileNumber: string;
  accountNumber: string;
  aadharCardNumber: string;
  panCardNumber: string;
  imageUrl: string;
  costPerBag: number | undefined;
};
