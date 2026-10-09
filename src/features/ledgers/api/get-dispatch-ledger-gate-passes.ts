import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { PartyGatePass, PartyGatePassesResponse } from './types';

/**
 * Gate passes for one dispatch ledger.
 * The path matches a single-voucher fetch, but this id is the party and the
 * payload is `{ nikasiGatePasses }`. Kept separate from getNikasiGatePassById.
 */
export async function getDispatchLedgerGatePasses(id: string): Promise<PartyGatePass[] | null> {
  try {
    const { data } = await apiClient.get<PartyGatePassesResponse>(`/nikasi-gate-pass/${id}`);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to load dispatch gate passes');
    }

    return data.data.nikasiGatePasses ?? [];
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load dispatch gate passes'), {
      cause: error,
    });
  }
}
