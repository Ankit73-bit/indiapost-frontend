import { z } from 'zod';

export const noticeExcelFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  noticeType: z.string().min(1, 'Notice type is required'),
  noticeName: z.string().min(1, 'Notice name is required'),
  noticeDate: z.string().min(1, 'Notice date is required'),
  dispatchDate: z.string().optional(),
  description: z.string().optional(),
});

export type NoticeExcelFormValues = z.infer<typeof noticeExcelFormSchema>;
