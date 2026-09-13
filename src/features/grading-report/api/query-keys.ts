import type { GradingGatePassReportParams } from './types';

export const gradingGatePassReportKeys = {
  all: ['grading-gate-pass', 'report'] as const,
  list: (params: GradingGatePassReportParams) =>
    [...gradingGatePassReportKeys.all, params] as const,
};
