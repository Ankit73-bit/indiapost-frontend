import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NoticeTemplateMapPageHeaderProps } from '@/pages/notice/noticeTemplateMapPage.types';

export function NoticeTemplateMapPageHeader({
  listUrl,
  noticeName,
  onOpenEditor,
}: NoticeTemplateMapPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 h-8">
          <Link to={listUrl}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Templates
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">Template mapping</h2>
        <p className="text-sm text-muted-foreground">
          {noticeName} — maps state/language keys to .typ files for PDF generation.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onOpenEditor}>
        Open editor
      </Button>
    </div>
  );
}
