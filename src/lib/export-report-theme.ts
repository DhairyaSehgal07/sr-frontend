/**
 * Shadcn theme tokens from `src/index.css` (:root), converted to Excel ARGB.
 * Keeps exported reports aligned with in-app primary green branding.
 */
export const EXPORT_THEME_COLORS = {
  primary: 'FF008236',
  primaryForeground: 'FFF0FDF4',
  primaryMutedFill: 'FFE6F3EB',
  primarySoftFill: 'FFCCE6D7',
  foreground: 'FF09090B',
  mutedForeground: 'FF71717B',
  mutedFill: 'FFF4F4F5',
  border: 'FFE4E4E7',
  zebraFill: 'FFFAFAFA',
  white: 'FFFFFFFF',
} as const;

export const COLDOP_BRANDING = {
  label: 'Powered by ',
  name: 'Coldop',
} as const;

/** CSS hex equivalents of EXPORT_THEME_COLORS for HTML preview/print. */
export const EXPORT_THEME_CSS = {
  primary: '#008236',
  primaryForeground: '#f0fdf4',
  primaryMutedFill: '#e6f3eb',
  primarySoftFill: '#cce6d7',
  foreground: '#09090b',
  mutedForeground: '#71717b',
  mutedFill: '#f4f4f5',
  border: '#e4e4e7',
  zebraFill: '#fafafa',
  background: '#ffffff',
} as const;
