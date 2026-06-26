import { NoticeTemplateEditor } from '@/components/notice/editor/NoticeTemplateEditor';
import { NoticeTemplatePageLoading } from './NoticeTemplatePageLoading';
import { NoticeTemplatePageNotFound } from './NoticeTemplatePageNotFound';
import { useNoticeTemplateEditorPage } from './useNoticeTemplateEditorPage';

export function NoticeTemplateEditorPage() {
  const page = useNoticeTemplateEditorPage();

  if (page.isLoading) {
    return (
      <NoticeTemplatePageLoading className="flex h-full items-center justify-center" />
    );
  }

  if (page.isError || !page.template) {
    return <NoticeTemplatePageNotFound listUrl={page.listUrl} />;
  }

  return (
    <NoticeTemplateEditor
      template={page.template}
      listUrl={page.listUrl}
      onTemplateUpdated={() => {
        void page.refetch();
      }}
    />
  );
}
