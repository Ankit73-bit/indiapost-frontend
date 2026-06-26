import { useParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import { getNoticeTemplatesListUrl } from './noticePage.utils';

export function useNoticeTemplateEditorPage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const { data: template, isLoading, isError, refetch } = useGetNoticeTemplateQuery(
    templateId,
    { skip: !templateId },
  );

  const listUrl = getNoticeTemplatesListUrl(isAdmin, clientId);

  return {
    template,
    isLoading,
    isError,
    listUrl,
    refetch,
  };
}
