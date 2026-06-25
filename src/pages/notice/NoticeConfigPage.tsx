import { NoticeConfigEditor } from '@/components/notice/config/NoticeConfigEditor';
import { NoticeConfigSidebar } from '@/components/notice/config/NoticeConfigSidebar';
import { useNoticeConfigPage } from '@/hooks/useNoticeConfigPage';

export function NoticeConfigPage() {
  const page = useNoticeConfigPage();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <NoticeConfigSidebar
        clientId={page.clientId}
        clientName={page.selectedClient?.name}
        configs={page.configs}
        listLoading={page.listLoading}
        selectedId={page.selectedId}
        isCreating={page.isCreating}
        onStartCreate={page.startCreate}
        onSelectConfig={page.selectConfig}
      />

      <div className="min-w-0 flex-1">
        {page.isCreating ? (
          <NoticeConfigEditor
            clientId={page.clientId}
            templates={page.templates}
            onCreated={page.handleCreated}
            onCancel={page.handleCreateCancel}
            editorUrl={page.editorUrl}
          />
        ) : page.selectedId ? (
          <NoticeConfigEditor
            clientId={page.clientId}
            configId={page.selectedId}
            templates={page.templates}
            editorUrl={page.editorUrl}
            onDeleted={page.handleDeleted}
          />
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Select or create a config to edit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
