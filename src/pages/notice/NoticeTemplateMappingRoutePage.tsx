import { NoticeTemplateMapPage } from '@/pages/notice/NoticeTemplateMapPage';
import { NoticeTemplatePageLoading } from './NoticeTemplatePageLoading';
import { NoticeTemplatePageNotFound } from './NoticeTemplatePageNotFound';
import { useNoticeTemplateMappingRoutePage } from './useNoticeTemplateMappingRoutePage';

export function NoticeTemplateMappingRoutePage() {
  const page = useNoticeTemplateMappingRoutePage();

  if (page.isLoading) {
    return (
      <NoticeTemplatePageLoading className="flex min-h-[320px] items-center justify-center" />
    );
  }

  if (page.isError || !page.templateId) {
    return <NoticeTemplatePageNotFound listUrl={page.listUrl} />;
  }

  return <NoticeTemplateMapPage templateId={page.templateId} />;
}
