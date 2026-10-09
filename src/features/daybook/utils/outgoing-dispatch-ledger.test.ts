import { describe, expect, it } from 'vitest';

import {
  outgoingDispatchLedgerId,
  resolveOutgoingDispatchLedger,
} from './outgoing-dispatch-ledger';

const ledgerId = '64f1a2b3c4d5e6f7a8b9c0d4';

describe('resolveOutgoingDispatchLedger', () => {
  it('reads a populated party from the entry', () => {
    expect(
      resolveOutgoingDispatchLedger({
        _id: ledgerId,
        name: 'Kapur Traders',
        address: 'Mandi Road',
        mobileNumber: '9811122233',
      }),
    ).toEqual({
      _id: ledgerId,
      name: 'Kapur Traders',
      address: 'Mandi Road',
      mobileNumber: '9811122233',
    });
  });

  it('looks up a bare id in the ledger list', () => {
    expect(
      resolveOutgoingDispatchLedger(ledgerId, [
        {
          _id: ledgerId,
          name: 'Kapur Traders',
          address: 'Mandi Road',
          mobileNumber: '9811122233',
        },
      ]),
    ).toEqual({
      _id: ledgerId,
      name: 'Kapur Traders',
      address: 'Mandi Road',
      mobileNumber: '9811122233',
    });
    expect(outgoingDispatchLedgerId(ledgerId)).toBe(ledgerId);
  });

  it('returns nothing when the entry has no ledger', () => {
    expect(resolveOutgoingDispatchLedger(undefined)).toBeUndefined();
    expect(outgoingDispatchLedgerId(undefined)).toBe('');
  });
});
