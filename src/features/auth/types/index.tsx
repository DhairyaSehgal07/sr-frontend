export interface LoginCredentials {
  mobileNumber: string;
  password: string;
}

export type Role = 'Admin' | 'Manager' | 'Staff';

export interface ColdStorage {
  _id: string;
  name: string;
  address: string;
  capacity: number;
  imageUrl: string;
  isPaid: boolean;
  /** JPGA membership number only, e.g. "01083". The PDF prefixes "JPGA NO.". */
  jpgaNumber?: string;
  tagline?: string;
  /** Full letterhead phone line, e.g. "M. 98152-09363, WhatsApp 95926-09363". */
  contactNumbers?: string;
}

export interface AuthUser {
  _id: string;
  coldStorageId: ColdStorage;
  name: string;
  mobileNumber: string;
  role: Role;
  isVerified: boolean;
}

export interface LoginResponseData extends AuthUser {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: LoginResponseData | null;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  data: null;
  message: string;
}
