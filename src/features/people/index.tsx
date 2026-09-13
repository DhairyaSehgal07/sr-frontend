import { getRouteApi } from '@tanstack/react-router';
import { BookOpen, Users } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { preserveScroll } from '@/lib/preserve-scroll';

import type { PeopleTab } from './search';
import DispatchLedgerTab from './components/dispatch-ledger-tab';
import PeopleTabContent from './components/people-tab';

const peopleRouteApi = getRouteApi('/_authenticated/people/');

const PeoplePage = () => {
  const { tab } = peopleRouteApi.useSearch();
  const navigate = peopleRouteApi.useNavigate();

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as PeopleTab },
      ...preserveScroll,
    });
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="people">
            <Users className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">People</span>
          </TabsTrigger>

          <TabsTrigger value="dispatch-ledger">
            <BookOpen className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:block">Dispatch-ledger</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="min-w-0">
          <PeopleTabContent />
        </TabsContent>

        <TabsContent value="dispatch-ledger" className="min-w-0">
          <DispatchLedgerTab />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default PeoplePage;
