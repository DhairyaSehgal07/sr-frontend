import { z } from 'zod';

export const FARMER_PROFILE_GATE_PASS_TAB_VALUES = [
  'incoming',
  'grading',
  'storage',
  'dispatch',
  'booking',
] as const;

export const farmerProfileGatePassTabSchema = z.enum(FARMER_PROFILE_GATE_PASS_TAB_VALUES);

export const farmerProfileSearchSchema = z.object({
  name: z.string(),
  mobileNumber: z.string(),
  accountNumber: z.coerce.number(),
  address: z.string(),
  tab: farmerProfileGatePassTabSchema.catch('incoming'),
});

export type FarmerProfileSearch = z.infer<typeof farmerProfileSearchSchema>;
export type FarmerProfileGatePassTab = z.infer<typeof farmerProfileGatePassTabSchema>;
