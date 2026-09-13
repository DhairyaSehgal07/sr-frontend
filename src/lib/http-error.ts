import { isAxiosError } from 'axios';

/** Reads HTTP status from an axios error or from `Error.cause` when wrapped. */
export function getHttpStatusFromError(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof Error && error.cause !== undefined) {
    return getHttpStatusFromError(error.cause);
  }

  return undefined;
}
