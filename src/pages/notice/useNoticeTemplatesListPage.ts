import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeConfigsQuery } from '@/store/api/noticeConfigsApi';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import {
  NOTICE_CONFIG_LIST_LIMIT,
  NOTICE_CONFIG_LIST_PAGE,
} from './noticeConfigPage.constants';
import { NOTICE_TEMPLATES_PAGE_SIZE } from './noticeTemplatesListPage.constants';
import type { StatusFilter } from './noticeTemplatesListPage.types';
import type { NoticeConfigRecord } from '@/types';

export function useNoticeTemplatesListPage() {
  const navigate = useNavigate();
  const { clientId, isAdmin } = useNoticeClientContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [linkDialogTemplateId, setLinkDialogTemplateId] = useState<string | null>(
    null,
  );

  const { data, isLoading, refetch: refetchTemplates } = useListNoticeTemplatesQuery(
    { clientId, page, limit: NOTICE_TEMPLATES_PAGE_SIZE },
    { skip: !clientId },
  );

  const { data: configsData, refetch: refetchConfigs } = useListNoticeConfigsQuery(
    { clientId: clientId!, page: NOTICE_CONFIG_LIST_PAGE, limit: NOTICE_CONFIG_LIST_LIMIT },
    { skip: !clientId },
  );

  const configs = configsData?.data ?? [];

  const configById = useMemo(() => {
    const map = new Map<string, NoticeConfigRecord>();
    for (const config of configs) {
      map.set(config._id, config);
    }
    return map;
  }, [configs]);

  const filtered = useMemo(() => {
    let items = data?.data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (t) =>
          t.noticeName.toLowerCase().includes(q) ||
          t.noticeId.toLowerCase().includes(q),
      );
    }
    if (statusFilter === 'active') {
      items = items.filter((t) => t.activeVersion);
    }
    if (statusFilter === 'draft') {
      items = items.filter((t) =>
        t.versions.some((v) => v.status === 'draft'),
      );
    }
    return items;
  }, [data?.data, search, statusFilter]);

  const createUrl =
    isAdmin && clientId
      ? `/notice-generator/templates/new?clientId=${clientId}`
      : '/notice-generator/templates/new';

  function openTemplate(id: string) {
    const url =
      isAdmin && clientId
        ? `/notice-generator/templates/${id}/editor?clientId=${clientId}`
        : `/notice-generator/templates/${id}/editor`;
    navigate(url);
  }

  function openMapping(templateId: string, version?: string) {
    const base =
      isAdmin && clientId
        ? `/notice-generator/templates/${templateId}/mapping?clientId=${clientId}`
        : `/notice-generator/templates/${templateId}/mapping`;
    const url = version
      ? `${base}${base.includes('?') ? '&' : '?'}version=${version}`
      : base;
    navigate(url);
  }

  function openSampleExcel(templateId: string) {
    const url =
      isAdmin && clientId
        ? `/notice-generator/templates/${templateId}/sample-excel?clientId=${clientId}`
        : `/notice-generator/templates/${templateId}/sample-excel`;
    navigate(url);
  }

  function openLinkConfig(templateId: string) {
    setLinkDialogTemplateId(templateId);
  }

  function closeLinkConfig() {
    setLinkDialogTemplateId(null);
  }

  async function handleConfigLinked() {
    closeLinkConfig();
    await Promise.all([refetchTemplates(), refetchConfigs()]);
  }

  return {
    clientId,
    isAdmin,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    data,
    isLoading,
    filtered,
    configs,
    configById,
    createUrl,
    setPage,
    openTemplate,
    openMapping,
    openSampleExcel,
    linkDialogTemplateId,
    openLinkConfig,
    closeLinkConfig,
    handleConfigLinked,
  };
}
