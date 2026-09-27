import { Sprout } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

const DaybookSeedTab = () => {
  return (
    <Empty className="rounded-xl border bg-muted/10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sprout />
        </EmptyMedia>
        <EmptyTitle>Seed coming soon</EmptyTitle>
        <EmptyDescription>This section is not available yet.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default DaybookSeedTab;
