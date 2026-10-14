import { getHttpStatusFromError } from '@/lib/http-error';

export function stockFilterErrorMessage(error: unknown, fallback: string): string {
  if (getHttpStatusFromError(error) === 409) {
    return 'This cold storage already has a stock filter with that name.';
  }

  return error instanceof Error ? error.message : fallback;
}
