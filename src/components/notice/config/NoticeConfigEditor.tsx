import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Upload } from 'lucide-react';
import { NoticeConfigForm } from '@/components/notice/NoticeConfigForm';
import { NoticeVariableValidationPanel } from '@/components/notice/NoticeVariableValidationPanel';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeConfigEditorHeader } from '@/components/notice/config/NoticeConfigEditorHeader';
import { NoticeConfigTemplateLinkSection } from '@/components/notice/config/NoticeConfigTemplateLinkSection';
import { useNoticeConfigEditor } from '@/hooks/useNoticeConfigEditor';
import type { NoticeConfigEditorProps } from '@/pages/notice/noticeConfigPage.types';

export function NoticeConfigEditor({
  clientId,
  configId,
  templates,
  onCreated,
  onCancel,
  onDeleted,
  editorUrl,
}: NoticeConfigEditorProps) {
  const editor = useNoticeConfigEditor({
    clientId,
    configId,
    templates,
    onCreated,
    onDeleted,
  });

  // For existing configs, upload section is collapsed by default
  const [uploadOpen, setUploadOpen] = useState(editor.isNew);

  if (!editor.isNew && editor.isLoading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NoticeConfigEditorHeader
        isNew={editor.isNew}
        title={editor.record?.name}
        noticeId={editor.record?.noticeId}
        creating={editor.creating}
        saving={editor.saving}
        deleting={editor.deleting}
        onCancel={onCancel}
        onDelete={editor.handleDelete}
        onSave={editor.handleSave}
      />

      <NoticeConfigTemplateLinkSection
        isNew={editor.isNew}
        templates={templates}
        linkTemplateId={editor.linkTemplateId}
        onLinkTemplateIdChange={editor.setLinkTemplateId}
        linkedTemplate={editor.linkedTemplate}
        recordLinkedTemplateId={editor.record?.linkedTemplateId}
        editorUrl={editorUrl}
        configFileName={editor.configFileName}
        onConfigFileNameChange={editor.setConfigFileName}
        onLink={editor.handleLink}
        onUnlink={editor.handleUnlink}
        linking={editor.linking}
        unlinking={editor.unlinking}
      />

      {/* Upload JSON — always available, collapsible for existing configs */}
      <div className="rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setUploadOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {editor.isNew ? 'Import from JSON' : 'Replace from JSON'}
            </span>
            {!editor.isNew && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                overwrites form
              </span>
            )}
          </div>
          {uploadOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {uploadOpen && (
          <div className="border-t border-border p-4">
            <FileDropZone
              accept=".json,application/json"
              acceptLabel="JSON config"
              files={[]}
              multiple={false}
              onFilesChange={(files) => {
                if (files[0]) {
                  void editor.handleUpload([files[0]]);
                  if (!editor.isNew) setUploadOpen(false);
                }
              }}
              emptyHint={
                editor.isNew
                  ? 'Upload a config JSON to pre-fill the form below'
                  : 'Upload a config JSON to replace the current values'
              }
            />
          </div>
        )}
      </div>

      <NoticeConfigForm
        values={editor.formValues}
        onChange={editor.setFormValues}
        clientId={clientId}
        errors={editor.formErrors}
      />

      {editor.validation && (
        <NoticeVariableValidationPanel validation={editor.validation} />
      )}
    </div>
  );
}
