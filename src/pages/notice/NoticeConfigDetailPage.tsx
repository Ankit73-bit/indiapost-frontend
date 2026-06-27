import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoticeConfigEditor } from '@/components/notice/config/NoticeConfigEditor';
import { useNoticeConfigDetailPage } from '@/hooks/useNoticeConfigDetailPage';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';

export function NoticeConfigDetailPage() {
  const page = useNoticeConfigDetailPage();

  // Fetch the record just for the header title — editor fetches it too (RTK Query dedupes)
  const { data: record } = useGetNoticeConfigQuery(page.configId!, {
    skip: !page.configId,
  });

  return (
    <div className="space-y-0">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 shrink-0" onClick={page.goToList}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Configs
          </Button>
          <div className="h-5 w-px shrink-0 bg-border" />
          {page.isNew ? (
            <p className="text-sm font-semibold">New config</p>
          ) : record ? (
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold">{record.name}</p>
              <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                {record.noticeId}
              </span>
            </div>
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <NoticeConfigEditor
          key={page.configId ?? 'new'}
          clientId={page.clientId}
          configId={page.configId}
          templates={page.templates}
          onCreated={page.handleCreated}
          onCancel={page.goToList}
          onDeleted={page.handleDeleted}
          editorUrl={page.editorUrl}
        />
      </div>
    </div>
  );
}
