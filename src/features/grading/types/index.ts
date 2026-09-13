import type { GatePassData } from '@/components/incoming-gate-pass-card';

export type GradingSubmitMeta = {
  submitAction: 'review' | 'submit';
};

export const defaultGradingSubmitMeta: GradingSubmitMeta = {
  submitAction: 'review',
};

export type GradingSelectIncomingGatePasses = Pick<
  GatePassData,
  | '_id'
  | 'gatePassNo'
  | 'manualGatePassNumber'
  | 'date'
  | 'variety'
  | 'truckNumber'
  | 'bagsReceived'
  | 'status'
> & {
  weightSlip?: GatePassData['weightSlip'];
};
