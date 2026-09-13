import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  ArrowLeftRight,
  BarChart3,
  Inbox,
  PackageCheck,
  RefreshCw,
  Scale,
  Sprout,
} from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { preserveScroll } from '@/lib/preserve-scroll';

import AnalyticsGradingTab from './components/analytics-grading-tab';
import AnalyticsIncomingTab from './components/analytics-incoming-tab';
import AnalyticsStorageTab from './components/analytics-storage-tab';
import Overview from './components/overview';
import type { AnalyticsTab } from './search';
import type { AnalyticsDateParams } from './types';

function toAnalyticsDateParam(date: Date | undefined): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
}

const analyticsRouteApi = getRouteApi('/_authenticated/analytics');

const TAB_PLACEHOLDER: Record<Exclude<AnalyticsTab, 'incoming' | 'grading' | 'storage'>, string> = {
  dispatch: 'Show Dispatch Analytics here',
  booking: 'Show Booking Analytics here',
};

function AnalyticsTabPlaceholder({
  tab,
}: {
  tab: Exclude<AnalyticsTab, 'incoming' | 'grading' | 'storage'>;
}) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Placeholder content for this section</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{TAB_PLACEHOLDER[tab]}</p>
      </CardContent>
    </Card>
  );
}

const AnalyticsPage = () => {
  const { tab } = analyticsRouteApi.useSearch();
  const navigate = analyticsRouteApi.useNavigate();
  const queryClient = useQueryClient();

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [appliedDateRange, setAppliedDateRange] = useState<AnalyticsDateParams>({});

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as AnalyticsTab },
      ...preserveScroll,
    });
  };

  const handleApply = () => {
    const next: AnalyticsDateParams = {};
    const dateFrom = toAnalyticsDateParam(fromDate);
    const dateTo = toAnalyticsDateParam(toDate);
    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;
    setAppliedDateRange(next);
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedDateRange({});
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Analytics</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:gap-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <DatePickerInput
            id="analytics-from"
            label="From"
            placeholder="Start date"
            value={fromDate}
            onChange={setFromDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <DatePickerInput
            id="analytics-to"
            label="To"
            placeholder="End date"
            value={toDate}
            onChange={setToDate}
            className="min-w-0 sm:max-w-[220px] sm:flex-1"
          />

          <div className="flex gap-2 sm:shrink-0">
            <Button className="flex-1 sm:flex-none" onClick={handleApply}>
              Apply
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <section>
        <Overview dateFrom={appliedDateRange.dateFrom} dateTo={appliedDateRange.dateTo} />
      </section>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full gap-4">
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

        <TabsContent value="incoming" className="min-w-0">
          <AnalyticsIncomingTab
            dateFrom={appliedDateRange.dateFrom}
            dateTo={appliedDateRange.dateTo}
          />
        </TabsContent>

        <TabsContent value="grading" className="min-w-0">
          <AnalyticsGradingTab
            dateFrom={appliedDateRange.dateFrom}
            dateTo={appliedDateRange.dateTo}
          />
        </TabsContent>

        <TabsContent value="storage" className="min-w-0">
          <AnalyticsStorageTab
            dateFrom={appliedDateRange.dateFrom}
            dateTo={appliedDateRange.dateTo}
          />
        </TabsContent>

        <TabsContent value="dispatch" className="min-w-0">
          <AnalyticsTabPlaceholder tab="dispatch" />
        </TabsContent>

        <TabsContent value="booking" className="min-w-0">
          <AnalyticsTabPlaceholder tab="booking" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
