export const temperatureKeys = {
  all: ['temperature'] as const,
  lists: () => [...temperatureKeys.all, 'list'] as const,
  list: () => [...temperatureKeys.lists()] as const,
  create: () => [...temperatureKeys.all, 'create'] as const,
  update: () => [...temperatureKeys.all, 'update'] as const,
};
