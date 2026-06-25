import { Loader2 } from 'lucide-react';
import { NoticeTemplateMapActions, NoticeTemplateMapHelpText } from '@/components/notice/mapping/NoticeTemplateMapActions';
import {
  NoticeTemplateMapEntriesLoading,
  NoticeTemplateMapEntriesTable,
} from '@/components/notice/mapping/NoticeTemplateMapEntriesTable';
import { NoticeTemplateMapNoTypFiles } from '@/components/notice/mapping/NoticeTemplateMapNoTypFiles';
import { NoticeTemplateMapPageHeader } from '@/components/notice/mapping/NoticeTemplateMapPageHeader';
import { NoticeTemplateMapReadOnlyBanner } from '@/components/notice/mapping/NoticeTemplateMapReadOnlyBanner';
import { NoticeTemplateMapVersionSelect } from '@/components/notice/mapping/NoticeTemplateMapVersionSelect';
import { useNoticeTemplateMapPage } from '@/hooks/useNoticeTemplateMapPage';
import type { NoticeTemplateMapPageProps } from '@/pages/notice/noticeTemplateMapPage.types';

export function NoticeTemplateMapPage({ templateId }: NoticeTemplateMapPageProps) {
  const page = useNoticeTemplateMapPage(templateId);

  if (page.templateLoading || !page.template) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <NoticeTemplateMapPageHeader
        listUrl={page.listUrl}
        noticeName={page.template.noticeName}
        onOpenEditor={() => page.navigate(page.editorUrl)}
      />

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <NoticeTemplateMapVersionSelect
          selectedVersion={page.selectedVersion}
          sortedVersions={page.sortedVersions}
          activeVersion={page.template.activeVersion}
          isBusy={page.isBusy}
          onVersionChange={page.setVersion}
        />

        {page.readOnly && <NoticeTemplateMapReadOnlyBanner />}

        {page.typFiles.length === 0 && (
          <NoticeTemplateMapNoTypFiles
            onOpenEditor={() => page.navigate(page.editorUrl)}
          />
        )}

        {page.mapLoading ? (
          <NoticeTemplateMapEntriesLoading />
        ) : (
          <NoticeTemplateMapEntriesTable
            entries={page.entries}
            typFiles={page.typFiles}
            readOnly={page.readOnly}
            isBusy={page.isBusy}
            onUpdateEntry={page.updateEntry}
            onRemoveEntry={page.removeEntry}
            onAddEntry={page.addEntry}
          />
        )}
      </div>

      <NoticeTemplateMapActions
        readOnly={page.readOnly}
        dirty={page.dirty}
        isBusy={page.isBusy}
        saving={page.saving}
        importing={page.importing}
        entriesCount={page.entries.length}
        importRef={page.importRef}
        onImport={page.handleImport}
        onSave={page.handleSave}
        onExport={page.handleExport}
      />

      <NoticeTemplateMapHelpText />
    </div>
  );
}
