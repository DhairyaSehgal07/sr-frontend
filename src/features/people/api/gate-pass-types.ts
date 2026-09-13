import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';
import type { GradingGatePass } from '@/features/grading/api/types';
import type { IncomingGatePass } from '@/features/incoming/api/types';
import type { StorageGatePass } from '@/features/storage/api/types';

export type FarmerStorageLinkGatePassesResult = {
  incoming: IncomingGatePass[];
  grading: GradingGatePass[];
  storage: StorageGatePass[];
  nikasi: NikasiGatePass[];
  outgoing: unknown[];
  totalIncomingBags: number;
  totalGradingBags: number;
  totalStorageBags: number;
};

/** Raw API payload — `nikasi` and `outgoing` are omitted when empty. */
export type FarmerStorageLinkGatePassesApiData = {
  incoming?: IncomingGatePass[];
  grading?: GradingGatePass[];
  storage?: StorageGatePass[];
  nikasi?: NikasiGatePass[];
  outgoing?: unknown[];
  totalIncomingBags?: number;
  totalGradingBags?: number;
  totalStorageBags?: number;
};

export type GetFarmerStorageLinkGatePassesResponse = {
  success: boolean;
  data: FarmerStorageLinkGatePassesApiData;
  message?: string;
};
