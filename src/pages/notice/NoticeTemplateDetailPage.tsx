import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { NoticeTemplateVersionWorkspace } from '@/components/notice/NoticeTemplateVersionWorkspace';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import {
  useGetNoticeTemplateQuery,
} from '@/store/api/noticeTemplatesApi';

export function NoticeTemplateDetailPage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const { data: template, isLoading, isError, refetch } = useGetNoticeTemplateQuery(
    templateId,
    { skip: !templateId },
  );

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
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

  return (
    <div className="space-y-6">
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

      <NoticeTemplateVersionWorkspace
        template={template}
        onUpdated={() => void refetch()}
      />
    </div>
  );
}
