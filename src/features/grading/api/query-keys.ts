import type { GradingGatePassEditsListParams, GradingGatePassListParams } from './types';

export const gradingGatePassKeys = {
  all: ['grading-gate-pass'] as const,
  lists: () => [...gradingGatePassKeys.all, 'list'] as const,
  list: (params: GradingGatePassListParams) => [...gradingGatePassKeys.lists(), params] as const,
  details: () => [...gradingGatePassKeys.all, 'detail'] as const,
  detail: (id: string) => [...gradingGatePassKeys.details(), id] as const,
  searches: () => [...gradingGatePassKeys.all, 'search'] as const,
  search: (number: number) => [...gradingGatePassKeys.searches(), number] as const,
  create: () => [...gradingGatePassKeys.all, 'create'] as const,
  update: (id: string) => [...gradingGatePassKeys.all, 'update', id] as const,
  linkIncoming: (gradingGatePassId: string) =>
    [...gradingGatePassKeys.all, 'link-incoming', gradingGatePassId] as const,
  delinkIncoming: (gradingGatePassId: string) =>
    [...gradingGatePassKeys.all, 'delink-incoming', gradingGatePassId] as const,
  editsLists: () => [...gradingGatePassKeys.all, 'edits'] as const,
  edits: (params: GradingGatePassEditsListParams) =>
    [...gradingGatePassKeys.editsLists(), params] as const,
};
