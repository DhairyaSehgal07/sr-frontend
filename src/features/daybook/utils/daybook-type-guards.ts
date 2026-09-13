import type {
  DaybookEntry,
  DaybookOutgoingEntry,
  DaybookStorageEntry,
} from '@/features/daybook/api/types';

export function isStorageEntry(entry: DaybookEntry): entry is DaybookStorageEntry {
  return entry.passKind === 'storage';
}

export function isOutgoingEntry(entry: DaybookEntry): entry is DaybookOutgoingEntry {
  return entry.passKind === 'outgoing';
}

export function isRenderableDaybookEntry(entry: DaybookEntry): boolean {
  return isStorageEntry(entry) || isOutgoingEntry(entry);
}
