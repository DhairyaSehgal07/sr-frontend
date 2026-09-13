import type { DispatchReportParams } from './types';

export const nikasiGatePassReportKeys = {
  all: ['nikasi-gate-pass', 'report'] as const,
  list: (params: DispatchReportParams) => [...nikasiGatePassReportKeys.all, params] as const,
};
