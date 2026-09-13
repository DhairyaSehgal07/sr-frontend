import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // TanStack requires these generic parameters for module augmentation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures, TData, TValue> {
    align?: 'left' | 'right';
    wrap?: boolean;
    numeric?: boolean;
    mono?: boolean;
    groupStart?: boolean;
    emphasize?: boolean;
    filterLabel?: string;
    filterValueFormatter?: (value: unknown) => string;
  }
}
