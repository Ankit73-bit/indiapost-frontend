import type { z } from 'zod';
import type { listFormSchema } from './listForm.schema';

export type ListFormValues = z.infer<typeof listFormSchema>;

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface ExportCurrentFilters {
  clientId: string | undefined;
  year: number | undefined;
  month: number | undefined;
  noticeType: string | undefined;
}
