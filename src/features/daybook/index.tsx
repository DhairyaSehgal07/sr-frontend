import { getRouteApi } from '@tanstack/react-router';
import { Sprout, Inbox, Scale, PackageCheck, ArrowLeftRight } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { preserveScroll } from '@/lib/preserve-scroll';

import type { DaybookTab } from './search';
import DaybookBookingTab from './components/booking-tab';
import DaybookDispatchTab from './components/dispatch-tab';
import DaybookGradingTab from './components/grading-tab';
import DaybookIncomingTab from './components/incoming-tab';
import DaybookStorageTab from './components/storage-tab';

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
        {/* Tab Triggers */}
        <TabsList className="h-11 w-full">
          <TabsTrigger value="incoming">
            <Sprout className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Incoming</span>
          </TabsTrigger>

          <TabsTrigger value="grading">
            <Inbox className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Grading</span>
          </TabsTrigger>

          <TabsTrigger value="storage">
            <Scale className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Storage</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch">
            <PackageCheck className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Dispatch</span>
          </TabsTrigger>

          <TabsTrigger value="booking">
            <ArrowLeftRight className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Booking</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="incoming" className="min-w-0">
          <DaybookIncomingTab />
        </TabsContent>

        <TabsContent value="grading" className="min-w-0">
          <DaybookGradingTab />
        </TabsContent>

        <TabsContent value="storage" className="min-w-0">
          <DaybookStorageTab />
        </TabsContent>

        <TabsContent value="dispatch" className="min-w-0">
          <DaybookDispatchTab />
        </TabsContent>

        <TabsContent value="booking" className="min-w-0">
          <DaybookBookingTab />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DaybookPage;
