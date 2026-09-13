import type {
  IncomingGatePassEditsListParams,
  IncomingGatePassListParams,
  IncomingGatePassesByFarmerParams,
} from './types';

export const incomingGatePassKeys = {
  all: ['incoming-gate-pass'] as const,
  lists: () => [...incomingGatePassKeys.all, 'list'] as const,
  list: (params: IncomingGatePassListParams) => [...incomingGatePassKeys.lists(), params] as const,
  byFarmerLists: () => [...incomingGatePassKeys.all, 'by-farmer'] as const,
  byFarmer: (farmerStorageLinkId: string, params: IncomingGatePassesByFarmerParams) =>
    [...incomingGatePassKeys.byFarmerLists(), farmerStorageLinkId, params] as const,
  searches: () => [...incomingGatePassKeys.all, 'search'] as const,
  search: (number: number) => [...incomingGatePassKeys.searches(), number] as const,
  create: () => [...incomingGatePassKeys.all, 'create'] as const,
  update: (id: string) => [...incomingGatePassKeys.all, 'update', id] as const,
  editsLists: () => [...incomingGatePassKeys.all, 'edits'] as const,
  edits: (params: IncomingGatePassEditsListParams) =>
    [...incomingGatePassKeys.editsLists(), params] as const,
};
