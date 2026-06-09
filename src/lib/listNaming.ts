import { toSlug } from '@/lib/helpers';

export interface ListNamingInput {
  clientSlug: string;
  noticeType: string;
  noticeDate: string;
  noticeName: string;
}

function parseNoticeDateParts(noticeDate: string): {
  year: string;
  month: string;
  day: string;
} {
  const iso = noticeDate.includes('T')
    ? noticeDate.slice(0, 10)
    : noticeDate;
  const [year, month, day] = iso.split('-');
  return { year, month, day };
}

/** clientslug-noticetype-year-month-date-noticename */
export function buildListSlug(input: ListNamingInput): string {
  const { year, month, day } = parseNoticeDateParts(input.noticeDate);
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

export function mergeNoticeTypes(
  ...sources: Array<Iterable<string> | undefined>
): string[] {
  const set = new Set<string>(DEFAULT_NOTICE_TYPES);
  for (const source of sources) {
    if (!source) continue;
    for (const t of source) {
      const v = t?.trim().toUpperCase();
      if (v) set.add(v);
    }
  }
  return [...set].sort();
}
