import { NoticeTemplatesListToolbar } from '@/components/notice/NoticeTemplatesListToolbar';
import { NoticeTemplatesTable } from '@/components/notice/NoticeTemplatesTable';
import { LinkConfigDialog } from '@/components/notice/config/LinkConfigDialog';
import { useNoticeTemplatesListPage } from './useNoticeTemplatesListPage';

export function NoticeTemplatesListPage() {
  const list = useNoticeTemplatesListPage();
  const linkDialogTemplate = list.linkDialogTemplateId
    ? list.filtered.find((template) => template._id === list.linkDialogTemplateId) ??
      list.data?.data.find((template) => template._id === list.linkDialogTemplateId)
    : undefined;

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
        configById={list.configById}
        createUrl={list.createUrl}
        meta={list.data?.meta}
        onPageChange={list.setPage}
        onOpenTemplate={list.openTemplate}
        onOpenMapping={list.openMapping}
        onOpenLinkConfig={list.openLinkConfig}
        onOpenSampleExcel={list.openSampleExcel}
      />

      {linkDialogTemplate && list.clientId && (
        <LinkConfigDialog
          open={Boolean(list.linkDialogTemplateId)}
          onOpenChange={(open) => {
            if (!open) list.closeLinkConfig();
          }}
          templateId={linkDialogTemplate._id}
          linkedConfigId={linkDialogTemplate.linkedConfigId}
          clientId={list.clientId}
          configs={list.configs}
          onLinked={() => void list.handleConfigLinked()}
        />
      )}
    </div>
  );
}
