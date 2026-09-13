import type {
  StorageGatePassEditsListParams,
  StorageGatePassListParams,
  StorageGatePassesByFarmerParams,
} from './types';

export const storageGatePassKeys = {
  all: ['storage-gate-pass'] as const,
  lists: () => [...storageGatePassKeys.all, 'list'] as const,
  list: (params: StorageGatePassListParams) => [...storageGatePassKeys.lists(), params] as const,
  byFarmerLists: () => [...storageGatePassKeys.all, 'by-farmer'] as const,
  byFarmer: (farmerStorageLinkId: string, params: StorageGatePassesByFarmerParams) =>
    [...storageGatePassKeys.byFarmerLists(), farmerStorageLinkId, params] as const,
  searches: () => [...storageGatePassKeys.all, 'search'] as const,
  search: (number: number) => [...storageGatePassKeys.searches(), number] as const,
  create: () => [...storageGatePassKeys.all, 'create'] as const,
  update: (id: string) => [...storageGatePassKeys.all, 'update', id] as const,
  editsLists: () => [...storageGatePassKeys.all, 'edits'] as const,
  edits: (params: StorageGatePassEditsListParams) =>
    [...storageGatePassKeys.editsLists(), params] as const,
};
