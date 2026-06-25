import { z } from 'zod';

export const listFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  noticeType: z.string().min(1, 'Notice type is required'),
  noticeName: z.string().min(1, 'Notice name is required'),
  noticeDate: z.string().min(1, 'Notice date is required'),
  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  description: z.string().optional(),
});
