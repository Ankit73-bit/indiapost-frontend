import { NOTICE_NAV_ICONS } from '@/config/nav';
import { NoticePlaceholderPage } from './NoticePlaceholderPage';

export function NoticeExcelPage() {
  return (
    <NoticePlaceholderPage
      title="Notice Excel upload"
      description="Upload spreadsheet data used to generate notice batches."
      icon={NOTICE_NAV_ICONS.excel}
    />
  );
}
