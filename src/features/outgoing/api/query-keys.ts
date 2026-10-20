export const outgoingGatePassKeys = {
  all: ['outgoing-gate-pass'] as const,
  lists: () => [...outgoingGatePassKeys.all, 'list'] as const,
  create: () => [...outgoingGatePassKeys.all, 'create'] as const,
  cancel: () => [...outgoingGatePassKeys.all, 'cancel'] as const,
  update: (id: string) => [...outgoingGatePassKeys.all, 'update', id] as const,
  shedSummary: () => [...outgoingGatePassKeys.all, 'shed-summary'] as const,
  bifurcations: (id: string) => [...outgoingGatePassKeys.all, 'bifurcations', id] as const,
  createBifurcation: () => [...outgoingGatePassKeys.all, 'create-bifurcation'] as const,
  deleteBifurcation: () => [...outgoingGatePassKeys.all, 'delete-bifurcation'] as const,
};
