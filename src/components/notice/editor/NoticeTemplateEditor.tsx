import { CodeEditorPane } from './CodeEditorPane';
import { FilesSidebar } from './FilesSidebar';
import { NoticeTemplateEditorHeader } from './NoticeTemplateEditorHeader';
import { NoticeTemplateEditorImagePreview } from './NoticeTemplateEditorImagePreview';
import { NoticeTemplateEditorLoading } from './NoticeTemplateEditorLoading';
import { NoticeTemplateEditorReadOnlyBanner } from './NoticeTemplateEditorReadOnlyBanner';
import type { NoticeTemplateEditorProps } from './noticeTemplateEditor.types';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { VersionsSidebar } from './VersionsSidebar';
import { useNoticeTemplateEditor } from '@/hooks/useNoticeTemplateEditor';

export function NoticeTemplateEditor({
  template: initialTemplate,
  listUrl,
  onTemplateUpdated,
}: NoticeTemplateEditorProps) {
  const editor = useNoticeTemplateEditor({ initialTemplate, onTemplateUpdated });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm">
      <NoticeTemplateEditorHeader
        noticeName={editor.template.noticeName}
        listUrl={listUrl}
        mappingPageUrl={editor.mappingPageUrl}
        linkedConfigId={editor.template.linkedConfigId}
        linkedConfig={editor.linkedConfig}
        linkedConfigFile={editor.linkedConfigFile}
        configPageUrl={editor.configPageUrl}
        linkConfigUrl={editor.linkConfigUrl}
      />

      {editor.isReadOnly && <NoticeTemplateEditorReadOnlyBanner />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <VersionsSidebar
          versions={editor.template.versions}
          activeVersion={editor.selectedVersion.version}
          activeVersionId={editor.template.activeVersion}
          onSelectVersion={editor.setVersion}
          onAddVersion={() => void editor.handleAddVersion()}
          isAddingVersion={editor.creatingVersion}
          onActivate={(v) => void editor.handleActivateVersion(v)}
          onDeactivate={(v) => void editor.handleDeactivateVersion(v)}
          isActivating={editor.activating}
          isDeactivating={editor.deactivating}
        />

        <FilesSidebar
          template={editor.template}
          version={editor.selectedVersion}
          activeFile={editor.activeFile}
          expandedFolders={editor.expandedFolders}
          onSelectFile={editor.setActiveFile}
          onToggleFolder={editor.handleToggleFolder}
          onUploadFiles={(files) => void editor.handleUpload(files)}
          isUploading={editor.uploading}
          readOnly={editor.isReadOnly}
        />

        {editor.loadingFiles ? (
          <NoticeTemplateEditorLoading />
        ) : editor.isImageFile ? (
          <NoticeTemplateEditorImagePreview
            activeFile={editor.activeFile}
            imageUrl={editor.imageUrls[editor.activeFile]}
          />
        ) : (
          <CodeEditorPane
            projectName={editor.template.noticeName}
            tabs={editor.editorTabs}
            activeTab={editor.activeFile}
            content={editor.currentContent}
            readOnly={editor.isReadOnly}
            isSaving={editor.savingFile}
            previewOpen={editor.previewOpen}
            linkedConfigFile={editor.linkedConfig ? editor.linkedConfigFile : undefined}
            onOpenConfig={() => editor.navigate(editor.configPageUrl)}
            onTabSelect={editor.setActiveFile}
            onTabClose={editor.handleTabClose}
            onContentChange={editor.handleContentChange}
            onSave={() => void editor.handleSaveFile()}
            onTogglePreview={editor.handleTogglePreview}
          />
        )}

        {editor.previewOpen &&
          !editor.isImageFile &&
          !editor.loadingFiles &&
          editor.activeFile.endsWith('.typ') && (
            <TemplatePreviewPanel
              fileName={editor.activeFile}
              pdfUrl={editor.previewUrl}
              loading={editor.isRenderingPreview}
              error={editor.previewError}
              onClose={() => editor.setPreviewOpen(false)}
              onRefresh={() => void editor.runPreview()}
            />
          )}
      </div>
    </div>
  );
}
