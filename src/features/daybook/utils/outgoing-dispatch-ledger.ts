import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import type { NikasiGatePassDispatchLedger } from '@/features/dispatch-pre-storage/api/types';
import type { DispatchLedger } from '@/features/people/types';

type LedgerLookup = Pick<DispatchLedger, '_id' | 'name' | 'address' | 'mobileNumber'>;

function trimmed(value: string | undefined): string {
  return value?.trim() ?? '';
}

function isPopulatedLedger(
  value: DaybookOutgoingEntry['dispatchLedgerId'],
): value is Exclude<DaybookOutgoingEntry['dispatchLedgerId'], string | undefined> {
  return typeof value === 'object' && value !== null;
}

export function outgoingDispatchLedgerId(
  value: DaybookOutgoingEntry['dispatchLedgerId'],
): string {
  if (typeof value === 'string') return value.trim();
  if (isPopulatedLedger(value)) return trimmed(value._id);
  return '';
}

function partyFromLedger(ledger: LedgerLookup): NikasiGatePassDispatchLedger {
  const address = trimmed(ledger.address);
  const mobileNumber = trimmed(ledger.mobileNumber);
  return {
    _id: ledger._id,
    name: trimmed(ledger.name),
    ...(address ? { address } : {}),
    ...(mobileNumber ? { mobileNumber } : {}),
  };
}

/** Prefer a populated party on the entry. A bare id is resolved from the ledger list. */
export function resolveOutgoingDispatchLedger(
  value: DaybookOutgoingEntry['dispatchLedgerId'],
  ledgers: readonly LedgerLookup[] = [],
): NikasiGatePassDispatchLedger | undefined {
  const id = outgoingDispatchLedgerId(value);
  const fromList = id ? ledgers.find((ledger) => ledger._id === id) : undefined;

  if (typeof value === 'string') {
    if (!id) return undefined;
    return fromList ? partyFromLedger(fromList) : { _id: id, name: '' };
  }

  if (!isPopulatedLedger(value)) return undefined;

  const name = trimmed(value.name) || trimmed(fromList?.name);
  const address = trimmed(value.address) || trimmed(fromList?.address);
  const mobileNumber = trimmed(value.mobileNumber) || trimmed(fromList?.mobileNumber);

  if (!id && !name && !address && !mobileNumber) return undefined;

  return {
    ...(id ? { _id: id } : {}),
    name,
    ...(address ? { address } : {}),
    ...(mobileNumber ? { mobileNumber } : {}),
  };
}
