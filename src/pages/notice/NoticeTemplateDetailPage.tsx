import { NoticeTemplateVersionWorkspace } from '@/components/notice/NoticeTemplateVersionWorkspace';
import { NoticeTemplateDetailPageHeader } from './NoticeTemplateDetailPageHeader';
import { NoticeTemplatePageLoading } from './NoticeTemplatePageLoading';
import { NoticeTemplatePageNotFound } from './NoticeTemplatePageNotFound';
import { useNoticeTemplateDetailPage } from './useNoticeTemplateDetailPage';

export function NoticeTemplateDetailPage() {
  const page = useNoticeTemplateDetailPage();

  if (page.isLoading) {
    return (
      <NoticeTemplatePageLoading className="flex justify-center py-20" />
    );
  }

  if (page.isError || !page.template) {
    return <NoticeTemplatePageNotFound listUrl={page.listUrl} />;
  }

  return (
    <div className="space-y-6">
      <NoticeTemplateDetailPageHeader listUrl={page.listUrl} template={page.template} />

      <NoticeTemplateVersionWorkspace
        template={page.template}
        onUpdated={() => void page.refetch()}
      />
    </div>
  );
}
