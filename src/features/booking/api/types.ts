import type {
  BookingFormValues,
  BookingPaymentMode,
} from '@/features/booking/schemas/booking-form-schema';

export type BookingGatePassBagSize = {
  size: string;
  variety: string;
  currentQuantity: number;
  initialQuantity: number;
  costPerBag?: number;
};

export type CreateBookingBody = {
  dispatchLedgerId: string;
  gatePassNo: number;
  date: string;
  bagSizes: BookingGatePassBagSize[];
  manualGatePassNumber?: number;
  expectedDateOfDelivery?: string | null;
  bank?: string;
  amount?: number;
  modeOfPayment?: BookingPaymentMode;
  remarks?: string;
  idempotencyKey?: string;
};

export type CreateBookingInput = {
  form: BookingFormValues;
  gatePassNo: number;
};

export type CreateBookingResponse = {
  success?: boolean;
  status?: string;
  data: Record<string, unknown> | null;
  message?: string;
};

export type BookingDispatchLedger = {
  _id: string;
  name: string;
  address?: string;
  mobileNumber?: string;
};

export type BookingCreatedBy = {
  _id?: string;
  name: string;
};

export type BookingEditHistoryEntry = Record<string, unknown>;

export type Booking = {
  _id: string;
  dispatchLedgerId: BookingDispatchLedger;
  createdBy?: BookingCreatedBy;
  gatePassNo: number;
  manualGatePassNumber?: number;
  date: string;
  expectedDateOfDelivery?: string;
  bank?: string;
  amount?: number;
  modeOfPayment?: BookingPaymentMode;
  bagSizes: BookingGatePassBagSize[];
  editHistory: BookingEditHistoryEntry[];
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BookingPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BookingListResult = {
  bookings: Booking[];
  pagination: BookingPagination;
};

export type BookingSortOrder = 'asc' | 'desc';

export type BookingListParams = {
  page?: number;
  limit?: number;
  sortOrder?: BookingSortOrder;
};

export type GetBookingsResponse = {
  success: boolean;
  data: BookingListResult;
  message?: string;
};

export type SearchBookingBody = {
  number: number;
};

export type SearchBookingsResult = {
  bookings: Booking[];
};

export type SearchBookingsResponse = {
  success: boolean;
  data: SearchBookingsResult;
  message?: string;
};

export type UpdateBookingBody = {
  manualGatePassNumber?: number | null;
  date: string;
  expectedDateOfDelivery?: string | null;
  dispatchLedgerId: string;
  bagSizes: BookingGatePassBagSize[];
  bank?: string | null;
  amount?: number | null;
  modeOfPayment?: BookingPaymentMode | null;
  remarks?: string;
};

export type UpdateBookingInput = {
  id: string;
  form: BookingFormValues;
  originalBagSizes: BookingGatePassBagSize[];
};

export type UpdateBookingResponse = {
  success: boolean;
  data: Booking;
  message?: string;
};

export type BookingAuditEditor = {
  _id: string;
  name: string;
  mobileNumber?: string;
};

export type BookingAuditRef = {
  _id: string;
  gatePassNo: number;
  manualGatePassNumber?: number;
  dispatchLedgerId: BookingDispatchLedger;
};

export type BookingAuditState = Partial<{
  manualGatePassNumber: number | null;
  date: string;
  expectedDateOfDelivery: string | null;
  dispatchLedgerId: BookingDispatchLedger | string;
  bagSizes: BookingGatePassBagSize[];
  bank: string | null;
  amount: number | null;
  modeOfPayment: BookingPaymentMode | string | null;
  remarks: string;
}>;

export type BookingAudit = {
  _id: string;
  bookingId: BookingAuditRef | string;
  editedById: BookingAuditEditor;
  previousState: BookingAuditState;
  modifiedState: BookingAuditState;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type BookingEditsListParams = {
  page?: number;
  limit?: number;
};

export type BookingEditsListResult = {
  audits: BookingAudit[];
  pagination: BookingPagination;
};

export type GetBookingEditsResponse = {
  success: boolean;
  data: BookingEditsListResult;
  message?: string;
};
