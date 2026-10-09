import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type DaybookTab, daybookTabSchema } from '@/features/daybook/search';

const DAYBOOK_TAB_STORAGE_KEY = 'daybook-tab';

interface DaybookTabState {
  tab: DaybookTab;
  setTab: (tab: DaybookTab) => void;
}

function parseTab(value: unknown): DaybookTab {
  const result = daybookTabSchema.safeParse(value);
  return result.success ? result.data : 'incoming';
}

/** Zustand persist writes `{ state, version }`. Read it before async rehydrate. */
function readStoredDaybookTab(): DaybookTab {
  if (typeof localStorage === 'undefined') return 'incoming';

  try {
    const raw = localStorage.getItem(DAYBOOK_TAB_STORAGE_KEY);
    if (!raw) return 'incoming';

    const parsed = JSON.parse(raw) as { state?: { tab?: unknown } };
    return parseTab(parsed.state?.tab);
  } catch {
    return 'incoming';
  }
}

export const useDaybookTabStore = create<DaybookTabState>()(
  persist(
    (set) => ({
      tab: readStoredDaybookTab(),
      setTab: (tab) => set({ tab }),
    }),
    {
      name: DAYBOOK_TAB_STORAGE_KEY,
      partialize: (state) => ({ tab: state.tab }),
      merge: (persisted, current) => ({
        ...current,
        tab: parseTab(
          persisted && typeof persisted === 'object' && 'tab' in persisted
            ? persisted.tab
            : undefined,
        ),
      }),
    },
  ),
);
