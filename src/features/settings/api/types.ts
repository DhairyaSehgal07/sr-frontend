export type BillBook = {
  _id: string;
  coldStorageId: string;
  name: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillBookIsActiveParam = 'true' | 'false';

export type BillBookListParams = {
  search?: string;
  isActive?: BillBookIsActiveParam;
};

export type GetBillBooksResponse = {
  success: boolean;
  data: BillBook[];
  message?: string;
};

export type GetBillBookByIdResponse = {
  success: boolean;
  data: BillBook;
  message?: string;
};

export type CreateBillBookBody = {
  name: string;
};

export type CreateBillBookResponse = {
  success: boolean;
  data: BillBook;
  message?: string;
};

export type UpdateBillBookBody = {
  name?: string;
  isActive?: boolean;
};

export type UpdateBillBookInput = {
  id: string;
  body: UpdateBillBookBody;
};

export type UpdateBillBookResponse = {
  success: boolean;
  data: BillBook;
  message?: string;
};
