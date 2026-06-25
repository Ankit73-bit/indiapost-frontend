import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { NoticeTemplate } from '@/types';

interface NoticeTemplateDetailPageHeaderProps {
  listUrl: string;
  template: NoticeTemplate;
}

export function NoticeTemplateDetailPageHeader({
  listUrl,
  template,
}: NoticeTemplateDetailPageHeaderProps) {
  return (
    <>
      <Link
        to={listUrl}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        All templates
      </Link>

      <div>
        <p className="font-mono text-xs text-muted-foreground">{template.noticeId}</p>
        <h2 className="text-xl font-semibold">{template.noticeName}</h2>
      </div>
    </>
  );
}
