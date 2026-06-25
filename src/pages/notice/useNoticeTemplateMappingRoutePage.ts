import { useParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import { getNoticeTemplatesListUrl } from './noticePage.utils';

export function useNoticeTemplateMappingRoutePage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const { isLoading, isError } = useGetNoticeTemplateQuery(templateId, {
    skip: !templateId,
  });

  const listUrl = getNoticeTemplatesListUrl(isAdmin, clientId);

  return {
    templateId,
    isLoading,
    isError,
    listUrl,
  };
}
