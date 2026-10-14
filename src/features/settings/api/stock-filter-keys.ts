export const stockFilterKeys = {
  all: ['stock-filters'] as const,
  lists: () => [...stockFilterKeys.all, 'list'] as const,
  list: () => [...stockFilterKeys.lists()] as const,
  create: () => [...stockFilterKeys.all, 'create'] as const,
  update: () => [...stockFilterKeys.all, 'update'] as const,
  remove: () => [...stockFilterKeys.all, 'delete'] as const,
};
