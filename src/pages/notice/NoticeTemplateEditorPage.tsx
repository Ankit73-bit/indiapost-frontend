import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { NoticeTemplateEditor } from '@/components/notice/editor/NoticeTemplateEditor';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';

export function NoticeTemplateEditorPage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const { data: template, isLoading, isError } = useGetNoticeTemplateQuery(
    templateId,
    { skip: !templateId },
  );

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted-foreground">Template not found.</p>
        <Link to={listUrl} className="text-sm text-primary hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  return <NoticeTemplateEditor template={template} listUrl={listUrl} />;
}