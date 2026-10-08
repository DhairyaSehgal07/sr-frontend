import { getRouteApi } from '@tanstack/react-router';
import { PackageCheck } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { preserveScroll } from '@/lib/preserve-scroll';

import type { DaybookTab } from './search';
import DaybookDispatchTab from './components/dispatch-tab';

const daybookRouteApi = getRouteApi('/_authenticated/daybook');

const DaybookPage = () => {
  const { tab } = daybookRouteApi.useSearch();
  const navigate = daybookRouteApi.useNavigate();

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as DaybookTab },
      ...preserveScroll,
    });
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="dispatch" aria-label="Dispatch">
            <PackageCheck className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Dispatch</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dispatch" className="min-w-0">
          <DaybookDispatchTab />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DaybookPage;
