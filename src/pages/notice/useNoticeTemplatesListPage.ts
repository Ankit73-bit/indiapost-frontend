import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import { NOTICE_TEMPLATES_PAGE_SIZE } from './noticeTemplatesListPage.constants';
import type { StatusFilter } from './noticeTemplatesListPage.types';

export function useNoticeTemplatesListPage() {
  const navigate = useNavigate();
  const { clientId, isAdmin } = useNoticeClientContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isLoading } = useListNoticeTemplatesQuery(
    { clientId, page, limit: NOTICE_TEMPLATES_PAGE_SIZE },
    { skip: !clientId },
  );

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

  return {
    clientId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    data,
    isLoading,
    filtered,
    createUrl,
    setPage,
    openTemplate,
    openMapping,
  };
}
