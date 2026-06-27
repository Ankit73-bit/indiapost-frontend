import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import { NOTICE_TEMPLATE_LIST_LIMIT } from '@/pages/notice/noticeConfigPage.constants';
import { buildNoticeConfigEditorUrl } from '@/pages/notice/noticeConfigPage.constants';
import type { NoticeConfigEditorUrlBuilder } from '@/pages/notice/noticeConfigPage.types';

export function useNoticeConfigDetailPage() {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientId, isAdmin } = useNoticeClientContext();
  const isNew = configId === 'new';

  const { data: templatesData } = useListNoticeTemplatesQuery(
    { clientId, limit: NOTICE_TEMPLATE_LIST_LIMIT },
    { skip: !clientId },
  );

  const templates = templatesData?.data ?? [];

  function goToList() {
    navigate(
      isAdmin && clientId
        ? `/notice-generator/config?clientId=${clientId}`
        : '/notice-generator/config',
    );
  }

  function handleCreated(id: string) {
    navigate(
      isAdmin && clientId
        ? `/notice-generator/config/${id}?clientId=${clientId}`
        : `/notice-generator/config/${id}`,
      { replace: true },
    );
  }

  function handleDeleted() {
    goToList();
  }

  const editorUrl: NoticeConfigEditorUrlBuilder = (templateId) =>
    buildNoticeConfigEditorUrl(templateId, isAdmin, clientId);

  return {
    configId: isNew ? undefined : configId,
    isNew,
    clientId,
    isAdmin,
    templates,
    goToList,
    handleCreated,
    handleDeleted,
    editorUrl,
  };
}
