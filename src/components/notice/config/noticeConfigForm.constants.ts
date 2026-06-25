import type { DateOutputStyle } from '@/types';

export const NOTICE_CONFIG_DATE_STYLES: { value: DateOutputStyle; label: string }[] = [
  { value: 'dd-mm-yyyy', label: 'dd-mm-yyyy (e.g. 17-06-2026)' },
  { value: 'dd-mmm-yyyy', label: 'dd-mmm-yyyy (e.g. 17-Jun-2026)' },
];

export const NOTICE_CONFIG_CORE_MAPPING_FIELDS = [
  { key: 'notice_id', label: 'Notice ID', required: true },
  { key: 'notice_name', label: 'Notice name', required: true },
  { key: 'id_field', label: 'ID field', required: true },
  { key: 'sort_field', label: 'Sort field', required: false },
] as const;
