import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { NoticeTemplateMapPage } from '@/pages/notice/NoticeTemplateMapPage';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';

export function NoticeTemplateMappingRoutePage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const { isLoading, isError } = useGetNoticeTemplateQuery(templateId, {
    skip: !templateId,
  });

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !templateId) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted-foreground">Template not found.</p>
        <Link to={listUrl} className="text-sm text-primary hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  return <NoticeTemplateMapPage templateId={templateId} />;
}
