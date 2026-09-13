import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function AnalyticsJsonSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function AnalyticsJsonError({
  title,
  message,
  onRetry,
  isRetrying,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {title}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={cn('mr-2 size-4', isRetrying && 'animate-spin')} aria-hidden />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function AnalyticsJsonSection({
  title,
  description,
  errorTitle,
  query,
  data: displayData,
}: {
  title: string;
  description: string;
  errorTitle: string;
  query: UseQueryResult<unknown, Error>;
  data?: unknown;
}) {
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  if (isLoading) {
    return <AnalyticsJsonSkeleton />;
  }

  if (isError && data === undefined) {
    return (
      <AnalyticsJsonError
        title={errorTitle}
        message={error.message}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <pre className="max-h-[min(70vh,32rem)] overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-foreground">
          {JSON.stringify(displayData ?? data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
