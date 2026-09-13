import { z } from 'zod';

export const PEOPLE_TAB_VALUES = ['people', 'dispatch-ledger'] as const;

export const peopleTabSchema = z.enum(PEOPLE_TAB_VALUES);

export const peopleSearchSchema = z.object({
  tab: peopleTabSchema.catch('people'),
});

export type PeopleTab = z.infer<typeof peopleTabSchema>;
