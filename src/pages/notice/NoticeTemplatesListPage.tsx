import { NoticeTemplatesListToolbar } from '@/components/notice/NoticeTemplatesListToolbar';
import { NoticeTemplatesTable } from '@/components/notice/NoticeTemplatesTable';
import { useNoticeTemplatesListPage } from './useNoticeTemplatesListPage';

export function NoticeTemplatesListPage() {
  const list = useNoticeTemplatesListPage();

  return (
    <div className="space-y-4">
      <NoticeTemplatesListToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        createUrl={list.createUrl}
        clientId={list.clientId}
      />

      <NoticeTemplatesTable
        isLoading={list.isLoading}
        clientId={list.clientId}
        filtered={list.filtered}
        createUrl={list.createUrl}
        meta={list.data?.meta}
        onPageChange={list.setPage}
        onOpenTemplate={list.openTemplate}
        onOpenMapping={list.openMapping}
      />
    </div>
  );
}
