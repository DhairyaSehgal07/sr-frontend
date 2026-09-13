export interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string;
  aadharCardNumber?: string;
  panCardNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerStorageLink {
  _id: string;
  farmerId: Farmer;
  coldStorageId: string;
  accountNumber: number;
  isActive: boolean;
  notes?: string;
}

export interface FarmerStorageLinksResponse {
  success: boolean;
  data: FarmerStorageLink[];
}

export type FarmerLinkOption = {
  farmerStorageLinkId: string;
  name: string;
  accountNumber: number;
};

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
