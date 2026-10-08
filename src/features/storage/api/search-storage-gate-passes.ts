import type { DaybookOutgoingEntry, DaybookStorageEntry } from '@/features/daybook/api/types';
import { daybookStorageEntryToGatePass } from '@/features/daybook/utils/daybook-storage-adapter';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  SearchStorageGatePassBody,
  SearchStorageGatePassesResponse,
  StorageGatePassSearchBy,
  StorageGatePassSearchResult,
} from './types';

const DEFAULT_SEARCH_BY: StorageGatePassSearchBy = 'gatePassNumber';

const EMPTY_RESULT: StorageGatePassSearchResult = {
  storageGatePasses: [],
  outgoingGatePasses: [],
};

function normalizeStorageEntry(entry: DaybookStorageEntry) {
  return daybookStorageEntryToGatePass({
    ...entry,
    passKind: 'storage',
    bagSizes: entry.bagSizes ?? [],
  });
}

function normalizeOutgoingEntry(entry: DaybookOutgoingEntry): DaybookOutgoingEntry {
  return {
    ...entry,
    passKind: 'outgoing',
    status: 'ACTIVE',
    orderDetails: entry.orderDetails ?? [],
    storageGatePassSnapshots: entry.storageGatePassSnapshots ?? [],
  };
}

export async function searchStorageGatePasses(
  body: SearchStorageGatePassBody,
): Promise<StorageGatePassSearchResult> {
  const searchBy = body.searchBy ?? DEFAULT_SEARCH_BY;

  try {
    const { data } = await apiClient.post<SearchStorageGatePassesResponse>(
      '/storage-gate-pass/search',
      {
        number: body.number,
        searchBy,
      },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to search storage gate passes');
    }

    return {
      storageGatePasses: (data.data?.storageGatePasses ?? []).map(normalizeStorageEntry),
      outgoingGatePasses: (data.data?.outgoingGatePasses ?? []).map(normalizeOutgoingEntry),
    };
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search storage gate passes'), {
      cause: error,
    });
  }
}
