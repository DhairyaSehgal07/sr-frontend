import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { DaybookListResult, DaybookQueryParams, DaybookResponse } from './types';

type LegacyDaybookPayload = {
  daybook: unknown[];
};

const EMPTY_PAGINATION: DaybookListResult['pagination'] = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
};

export function buildDaybookQueryParams(
  params: DaybookQueryParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.type) query.type = params.type;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;

  return query;
}

function isLegacyDaybookPayload(value: unknown): value is LegacyDaybookPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'daybook' in value &&
    Array.isArray((value as LegacyDaybookPayload).daybook)
  );
}

function parseDaybookResponse(
  body: DaybookResponse,
  limit = EMPTY_PAGINATION.itemsPerPage,
): DaybookListResult {
  const payload = body.data as DaybookListResult['entries'] | LegacyDaybookPayload | undefined;

  if (Array.isArray(payload)) {
    return {
      entries: payload,
      pagination: body.pagination ?? {
        ...EMPTY_PAGINATION,
        itemsPerPage: limit,
      },
      format: 'modern',
    };
  }

  if (isLegacyDaybookPayload(payload)) {
    return {
      entries: [],
      pagination: {
        ...EMPTY_PAGINATION,
        itemsPerPage: limit,
      },
      format: 'legacy',
    };
  }

  return { ...emptyDaybookResult(limit), format: 'modern' };
}

export async function getDaybook(params: DaybookQueryParams = {}): Promise<DaybookListResult> {
  try {
    const { data } = await apiClient.get<DaybookResponse>('/store-admin/daybook', {
      params: buildDaybookQueryParams(params),
    });

    if (!data.success) {
      throw new Error('Failed to load daybook');
    }

    return parseDaybookResponse(data, params.limit ?? EMPTY_PAGINATION.itemsPerPage);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load daybook'), {
      cause: error,
    });
  }
}

export function emptyDaybookResult(limit = EMPTY_PAGINATION.itemsPerPage): DaybookListResult {
  return {
    entries: [],
    pagination: {
      ...EMPTY_PAGINATION,
      itemsPerPage: limit,
    },
  };
}
