import { Loader2 } from 'lucide-react';
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

      {editor.isNew && (
        <FileDropZone
          accept=".json,application/json"
          acceptLabel="JSON config"
          files={[]}
          multiple={false}
          onFilesChange={(files) => {
            if (files[0]) void editor.handleUpload([files[0]]);
          }}
          emptyHint="Upload an existing config JSON to pre-fill the form"
        />
      )}

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
