import type {
  NikasiGatePass,
  UpdateNikasiGatePassPatch,
} from '@/features/dispatch-pre-storage/api/types';

export type NikasiGatePassEditDraft = {
  manualGatePassNumber: string;
  date: Date | undefined;
  category: string;
  dispatchLedgerId: string;
  from: string;
  to: string;
  truckNumber: string;
  transportCompany: string;
  LSNumber: string;
  driverName: string;
  owner: string;
  remarks: string;
};

export type NikasiGatePassEditField = keyof NikasiGatePassEditDraft;

const REQUIRED_MESSAGES: Partial<Record<NikasiGatePassEditField, string>> = {
  date: 'Select a date.',
  category: 'Category is required.',
  dispatchLedgerId: 'Select a dispatch ledger.',
  from: 'From is required.',
  to: 'To is required.',
  truckNumber: 'Truck number is required.',
};

function sameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function parseManualGatePassNumber(value: string): number | null | 'invalid' {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) return 'invalid';
  return parsed;
}

function assignTrimmedIfChanged(
  patch: UpdateNikasiGatePassPatch,
  key:
    | 'category'
    | 'from'
    | 'to'
    | 'transportCompany'
    | 'LSNumber'
    | 'driverName'
    | 'owner'
    | 'remarks',
  next: string,
  original: string | undefined,
) {
  const trimmed = next.trim();
  if (trimmed !== (original ?? '').trim()) {
    patch[key] = trimmed;
  }
}

export function nikasiGatePassEditFieldErrors(
  draft: NikasiGatePassEditDraft,
): Partial<Record<NikasiGatePassEditField, string>> {
  const errors: Partial<Record<NikasiGatePassEditField, string>> = {};

  if (parseManualGatePassNumber(draft.manualGatePassNumber) === 'invalid') {
    errors.manualGatePassNumber = 'Must be a whole number greater than zero.';
  }

  if (!draft.date) errors.date = REQUIRED_MESSAGES.date;
  if (!draft.category.trim()) errors.category = REQUIRED_MESSAGES.category;
  if (!draft.dispatchLedgerId) errors.dispatchLedgerId = REQUIRED_MESSAGES.dispatchLedgerId;
  if (!draft.from.trim()) errors.from = REQUIRED_MESSAGES.from;
  if (!draft.to.trim()) errors.to = REQUIRED_MESSAGES.to;
  if (!draft.truckNumber.trim()) errors.truckNumber = REQUIRED_MESSAGES.truckNumber;

  return errors;
}

export function draftFromNikasiGatePass(gatePass: NikasiGatePass): NikasiGatePassEditDraft {
  const parsedDate = new Date(gatePass.date);

  return {
    manualGatePassNumber:
      gatePass.manualGatePassNumber != null ? String(gatePass.manualGatePassNumber) : '',
    date: Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate,
    category: gatePass.category,
    dispatchLedgerId: gatePass.dispatchLedgerId._id ?? '',
    from: gatePass.from,
    to: gatePass.to,
    truckNumber: gatePass.truckNumber,
    transportCompany: gatePass.transportCompany ?? '',
    LSNumber: gatePass.LSNumber ?? '',
    driverName: gatePass.driverName ?? '',
    owner: gatePass.owner ?? '',
    remarks: gatePass.remarks ?? '',
  };
}

/** Returns only fields whose values differ from the loaded gate pass. */
export function buildNikasiGatePassPatch(
  gatePass: NikasiGatePass,
  draft: NikasiGatePassEditDraft,
): UpdateNikasiGatePassPatch {
  const patch: UpdateNikasiGatePassPatch = {};

  const manual = parseManualGatePassNumber(draft.manualGatePassNumber);
  if (manual === null) {
    if (gatePass.manualGatePassNumber != null) {
      patch.manualGatePassNumber = null;
    }
  } else if (manual !== 'invalid' && manual !== gatePass.manualGatePassNumber) {
    patch.manualGatePassNumber = manual;
  }

  assignTrimmedIfChanged(patch, 'category', draft.category, gatePass.category);

  if (draft.date) {
    const original = new Date(gatePass.date);
    if (Number.isNaN(original.getTime()) || !sameCalendarDay(draft.date, original)) {
      patch.date = draft.date.toISOString();
    }
  }

  const ledgerId = draft.dispatchLedgerId.trim();
  if (ledgerId !== (gatePass.dispatchLedgerId._id ?? '')) {
    patch.dispatchLedgerId = ledgerId;
  }

  assignTrimmedIfChanged(patch, 'from', draft.from, gatePass.from);
  assignTrimmedIfChanged(patch, 'to', draft.to, gatePass.to);

  const truckNumber = draft.truckNumber.trim().toUpperCase();
  if (truckNumber !== gatePass.truckNumber.trim().toUpperCase()) {
    patch.truckNumber = truckNumber;
  }

  assignTrimmedIfChanged(
    patch,
    'transportCompany',
    draft.transportCompany,
    gatePass.transportCompany,
  );
  assignTrimmedIfChanged(patch, 'LSNumber', draft.LSNumber, gatePass.LSNumber);
  assignTrimmedIfChanged(patch, 'driverName', draft.driverName, gatePass.driverName);
  assignTrimmedIfChanged(patch, 'owner', draft.owner, gatePass.owner);
  assignTrimmedIfChanged(patch, 'remarks', draft.remarks, gatePass.remarks);

  return patch;
}
