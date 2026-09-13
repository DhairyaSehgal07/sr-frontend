import type { ReactNode } from 'react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { LucideIcon } from 'lucide-react';

type GatePassListProps = {
  items: unknown[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  renderItem: (item: never) => ReactNode;
};

export function GatePassList({
  items,
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
  renderItem,
}: GatePassListProps) {
  if (items.length === 0) {
    return (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <EmptyIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={getGatePassId(item, index)}>{renderItem(item as never)}</div>
      ))}
    </div>
  );
}

function getGatePassId(item: unknown, index: number) {
  if (typeof item === 'object' && item != null && '_id' in item) {
    const id = (item as { _id?: string })._id;
    if (typeof id === 'string' && id.length > 0) return id;
  }

  return String(index);
}
