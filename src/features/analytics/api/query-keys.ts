export const coldStoreStockKeys = {
  all: ['cold-store-stock'] as const,
  lists: () => [...coldStoreStockKeys.all, 'list'] as const,
  list: () => [...coldStoreStockKeys.lists()] as const,
  create: () => [...coldStoreStockKeys.all, 'create'] as const,
  update: () => [...coldStoreStockKeys.all, 'update'] as const,
  remove: () => [...coldStoreStockKeys.all, 'delete'] as const,
};
