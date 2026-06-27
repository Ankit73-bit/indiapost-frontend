import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeConfigsQuery } from '@/store/api/noticeConfigsApi';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import { NOTICE_CONFIG_LIST_LIMIT, NOTICE_TEMPLATE_LIST_LIMIT } from '@/pages/notice/noticeConfigPage.constants';
import { buildNoticeConfigEditorUrl } from '@/pages/notice/noticeConfigPage.constants';
import type { NoticeConfigEditorUrlBuilder } from '@/pages/notice/noticeConfigPage.types';

export function useNoticeConfigListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clientId, isAdmin, selectedClient } = useNoticeClientContext();
  const [search, setSearch] = useState('');

  const { data: listData, isLoading } = useListNoticeConfigsQuery(
    { clientId, limit: NOTICE_CONFIG_LIST_LIMIT },
    { skip: !clientId },
  );

  const { data: templatesData } = useListNoticeTemplatesQuery(
    { clientId, limit: NOTICE_TEMPLATE_LIST_LIMIT },
    { skip: !clientId },
  );

  const configs = listData?.data ?? [];
  const templates = templatesData?.data ?? [];

  const filtered = search.trim()
    ? configs.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.noticeId.toLowerCase().includes(search.toLowerCase()),
      )
    : configs;

  const openConfig = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      navigate(
        isAdmin && clientId
          ? `/notice-generator/config/${id}?clientId=${clientId}`
          : `/notice-generator/config/${id}`,
      );
    },
    [navigate, isAdmin, clientId, searchParams],
  );

  const openCreate = useCallback(() => {
    navigate(
      isAdmin && clientId
        ? `/notice-generator/config/new?clientId=${clientId}`
        : '/notice-generator/config/new',
    );
  }, [navigate, isAdmin, clientId]);

  const editorUrl: NoticeConfigEditorUrlBuilder = (templateId) =>
    buildNoticeConfigEditorUrl(templateId, isAdmin, clientId);

  return {
    clientId,
    isAdmin,
    selectedClient,
    configs: filtered,
    allConfigs: configs,
    templates,
    isLoading,
    search,
    setSearch,
    openConfig,
    openCreate,
    editorUrl,
  };
}
