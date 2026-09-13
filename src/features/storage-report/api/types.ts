import type { StorageGatePass } from '@/features/storage/api/types';

export type StorageGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type StorageGatePassReportResult = {
  storageGatePasses: StorageGatePass[];
};

export type GetStorageGatePassReportResponse = {
  success: boolean;
  data: StorageGatePassReportResult;
  message?: string;
};
