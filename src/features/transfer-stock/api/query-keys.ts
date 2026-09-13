export const transferStockKeys = {
  all: ['transfer-stock'] as const,
  lists: () => [...transferStockKeys.all, 'list'] as const,
  create: () => [...transferStockKeys.all, 'create'] as const,
};
