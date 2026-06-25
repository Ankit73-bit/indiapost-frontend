import { COLUMN_FORMATS } from '@/lib/noticeConfig';
import type { NoticeTableColumnConfig } from '@/types';

export function parseColumnFormat(value: string): NoticeTableColumnConfig['format'] {
  if ((COLUMN_FORMATS as readonly string[]).includes(value)) {
    return value as NoticeTableColumnConfig['format'];
  }
  return 'str';
}
