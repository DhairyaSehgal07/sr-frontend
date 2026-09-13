import { JUTE_BAG_WEIGHT } from '@/lib/constants';

type IncomingWeightSource = {
  bagsReceived: number;
  grossWeightKg?: number;
  tareWeightKg?: number;
  weightSlip?: {
    grossWeightKg: number;
    tareWeightKg: number;
  };
};

const weightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function resolveGrossWeightKg(source: IncomingWeightSource) {
  return source.weightSlip?.grossWeightKg ?? source.grossWeightKg;
}

function resolveTareWeightKg(source: IncomingWeightSource) {
  return source.weightSlip?.tareWeightKg ?? source.tareWeightKg;
}

export function incomingNetWeightKg(source: IncomingWeightSource): number | null {
  const grossWeightKg = resolveGrossWeightKg(source);
  const tareWeightKg = resolveTareWeightKg(source);

  if (grossWeightKg == null || tareWeightKg == null) return null;

  return grossWeightKg - tareWeightKg - source.bagsReceived * JUTE_BAG_WEIGHT;
}

export function formatIncomingWeightKg(value: number) {
  return weightFormatter.format(value);
}
