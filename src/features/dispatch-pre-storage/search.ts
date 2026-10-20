import { z } from 'zod';

export const dispatchCreateSearchSchema = z.object({
  bookingId: z.string().optional(),
});
