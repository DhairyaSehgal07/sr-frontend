import type { StorageGatePassReportParams } from './types';

export const storageGatePassReportKeys = {
  all: ['storage-gate-pass', 'report'] as const,
  list: (params: StorageGatePassReportParams) =>
    [...storageGatePassReportKeys.all, params] as const,
};
