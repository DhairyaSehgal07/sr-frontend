export interface DispatchLedger {
  _id: string;
  name: string;
  address: string;
  mobileNumber?: string;
  coldStorageId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DispatchLedgersResponse {
  success: boolean;
  data: DispatchLedger[];
}
