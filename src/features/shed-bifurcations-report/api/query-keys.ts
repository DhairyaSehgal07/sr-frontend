import type { ShedBifurcationParams } from './types';

export const shedBifurcationKeys = {
  all: ['outgoing-gate-pass', 'bifurcations'] as const,
  list: (params: ShedBifurcationParams) => [...shedBifurcationKeys.all, params] as const,
};
