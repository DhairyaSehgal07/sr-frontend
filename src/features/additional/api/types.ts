export type TemperatureReadingItem = {
  chamber: string;
  value: number;
};

export type TemperatureRecord = {
  _id: string;
  coldStorageId: string;
  date: string;
  temperatureReading: TemperatureReadingItem[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GetTemperatureRecordsResponse = {
  success: boolean;
  data: TemperatureRecord[];
  message?: string;
};

export type CreateTemperatureRecordBody = {
  date: string;
  temperatureReading: TemperatureReadingItem[];
};

export type CreateTemperatureRecordResponse = {
  success: boolean;
  data: TemperatureRecord;
  message?: string;
};

export type UpdateTemperatureRecordBody = CreateTemperatureRecordBody;

export type UpdateTemperatureRecordInput = {
  id: string;
  body: UpdateTemperatureRecordBody;
};

export type UpdateTemperatureRecordResponse = {
  success: boolean;
  data: TemperatureRecord;
  message?: string;
};
