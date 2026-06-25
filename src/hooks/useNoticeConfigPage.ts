import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeConfigsQuery } from '@/store/api/noticeConfigsApi';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import {
  buildNoticeConfigEditorUrl,
  NOTICE_CONFIG_LIST_LIMIT,
  NOTICE_CONFIG_LIST_PAGE,
  NOTICE_TEMPLATE_LIST_LIMIT,
} from '@/pages/notice/noticeConfigPage.constants';
import type { NoticeConfigEditorUrlBuilder } from '@/pages/notice/noticeConfigPage.types';

export function useNoticeConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('configId');
  const { clientId, isAdmin, selectedClient } = useNoticeClientContext();
  const [isCreating, setIsCreating] = useState(false);

  const { data: listData, isLoading: listLoading } = useListNoticeConfigsQuery(
    { clientId, page: NOTICE_CONFIG_LIST_PAGE, limit: NOTICE_CONFIG_LIST_LIMIT },
    { skip: !clientId },
  );

  const { data: templatesData } = useListNoticeTemplatesQuery(
    { clientId, page: NOTICE_CONFIG_LIST_PAGE, limit: NOTICE_TEMPLATE_LIST_LIMIT },
    { skip: !clientId },
  );

  const configs = listData?.data ?? [];
  const templates = templatesData?.data ?? [];

  useEffect(() => {
    if (!selectedId && configs.length && !isCreating) {
      const next = new URLSearchParams(searchParams);
      next.set('configId', configs[0]!._id);
      setSearchParams(next, { replace: true });
    }
  }, [configs, selectedId, isCreating, searchParams, setSearchParams]);

  function selectConfig(id: string) {
    const next = new URLSearchParams(searchParams);
    next.set('configId', id);
    setSearchParams(next, { replace: true });
    setIsCreating(false);
  }

  function startCreate() {
    setIsCreating(true);
    const next = new URLSearchParams(searchParams);
    next.delete('configId');
    setSearchParams(next, { replace: true });
  }

  function handleCreated(id: string) {
    setIsCreating(false);
    selectConfig(id);
  }

  function handleCreateCancel() {
    setIsCreating(false);
    if (configs[0]) selectConfig(configs[0]._id);
  }

  function handleDeleted() {
    const next = new URLSearchParams(searchParams);
    next.delete('configId');
    setSearchParams(next, { replace: true });
  }

  const editorUrl: NoticeConfigEditorUrlBuilder = (templateId) =>
    buildNoticeConfigEditorUrl(templateId, isAdmin, clientId);

  return {
    clientId,
    selectedClient,
    configs,
    templates,
    listLoading,
    selectedId,
    isCreating,
    selectConfig,
    startCreate,
    handleCreated,
    handleCreateCancel,
    handleDeleted,
    editorUrl,
  };
}
