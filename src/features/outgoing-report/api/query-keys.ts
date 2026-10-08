import type { OutgoingReportParams } from './types';

export const outgoingGatePassReportKeys = {
  all: ['outgoing-gate-pass', 'report'] as const,
  list: (params: OutgoingReportParams) => [...outgoingGatePassReportKeys.all, params] as const,
};
