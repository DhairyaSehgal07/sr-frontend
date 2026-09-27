import { ExternalLink, Tractor } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { env } from '@/lib/env';

import { toGoogleSheetEmbedUrl } from '../lib/google-sheet-embed-url';

const DaybookFarmManagementTab = () => {
  const sheetUrl = env.googleSheetUrl.trim();
  const embedUrl = toGoogleSheetEmbedUrl(sheetUrl);

  if (!embedUrl) {
    return (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tractor />
          </EmptyMedia>
          <EmptyTitle>Farm sheet is not configured</EmptyTitle>
          <EmptyDescription>
            Add a Google Sheets link to show farm management here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <iframe
          title="Farm management sheet"
          src={embedUrl}
          className="h-[calc(100svh-12rem)] min-h-128 w-full border-0"
          loading="lazy"
          allow="clipboard-read; clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a
        href={sheetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary underline underline-offset-4"
      >
        Open in Google Sheets
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </div>
  );
};

export default DaybookFarmManagementTab;
