import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { getNoticeTemplatesListUrl } from './noticePage.utils';

export function useNoticeTemplateCreatePage() {
  const { clientId, isAdmin } = useNoticeClientContext();
  const listUrl = getNoticeTemplatesListUrl(isAdmin, clientId);

  return {
    clientId,
    isAdmin,
    listUrl,
  };
}
