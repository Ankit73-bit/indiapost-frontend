import { NOTICE_NAV_ICONS } from '@/config/nav';
import { NoticePlaceholderPage } from './NoticePlaceholderPage';

export function NoticeTemplatesPage() {
  return (
    <NoticePlaceholderPage
      title="Notice templates"
      description="Define and manage notice letter templates for generated dispatches."
      icon={NOTICE_NAV_ICONS.template}
    />
  );
}
