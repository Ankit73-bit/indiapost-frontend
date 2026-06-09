import { toSlug } from '@/lib/helpers';

export interface ListNamingInput {
  clientSlug: string;
  noticeType: string;
  noticeDate: string;
  noticeName: string;
}

/** clientslug-noticetype-year-month-date-noticename */
export function buildListSlug(input: ListNamingInput): string {
  const d = new Date(input.noticeDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const typeSlug = toSlug(input.noticeType);
  const nameSlug = toSlug(input.noticeName);
  const clientSlug = toSlug(input.clientSlug);

  return `${clientSlug}-${typeSlug}-${year}-${month}-${day}-${nameSlug}`;
}

export function buildListName(input: ListNamingInput): string {
  return buildListSlug(input);
}

export const DEFAULT_NOTICE_TYPES = [
  'DEMAND',
  'LEGAL',
  'REMINDER',
  'CUSTOM',
] as const;
