import type { ReactNode } from 'react';

export function RecordList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 md:hidden">{children}</div>;
}

export function RecordCard({ children }: { children: ReactNode }) {
  return (
    <article className="flex min-w-0 flex-col gap-2.5 rounded-lg border border-border bg-card p-3">
      {children}
    </article>
  );
}

export function RecordField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right text-sm text-foreground">{children}</div>
    </div>
  );
}
