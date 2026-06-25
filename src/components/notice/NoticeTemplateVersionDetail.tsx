import { Loader2 } from 'lucide-react';
import { NoticeVariableValidationPanel } from '@/components/notice/NoticeVariableValidationPanel';
import { NoticeTemplateVersionDetailHeader } from '@/components/notice/versionDetail/NoticeTemplateVersionDetailHeader';
import { NoticeTemplateVersionDetailTabs } from '@/components/notice/versionDetail/NoticeTemplateVersionDetailTabs';
import { NoticeTemplateVersionMetaStrip } from '@/components/notice/versionDetail/NoticeTemplateVersionMetaStrip';
import type { NoticeTemplateVersionDetailProps } from '@/components/notice/versionDetail/noticeTemplateVersionDetail.types';

export type { NoticeTemplateVersionDetailProps } from '@/components/notice/versionDetail/noticeTemplateVersionDetail.types';

export function NoticeTemplateVersionDetail({
  selectedVersion,
  detailVersion,
  configForm,
  clientId,
  isDefault,
  canActivate,
  typFileNames,
  imageFileNames,
  validation,
  configErrors,
  typFiles,
  imageFiles,
  creatingVersion,
  uploading,
  activating,
  savingConfig,
  savingLayout,
  onConfigFormChange,
  onWithHeaderChange,
  onSaveConfig,
  onMarkDefault,
  onDuplicateVersion,
  onTypFilesChange,
  onImageFilesChange,
  onUpload,
}: NoticeTemplateVersionDetailProps) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card">
      {!detailVersion || !configForm ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <NoticeTemplateVersionDetailHeader
            selectedVersion={selectedVersion}
            detailVersion={detailVersion}
            isDefault={isDefault}
            canActivate={canActivate}
            activating={activating}
            creatingVersion={creatingVersion}
            onMarkDefault={onMarkDefault}
            onDuplicateVersion={onDuplicateVersion}
          />

          <NoticeTemplateVersionMetaStrip
            detailVersion={detailVersion}
            typFileNames={typFileNames}
            imageFileNames={imageFileNames}
            configForm={configForm}
            savingLayout={savingLayout}
            onWithHeaderChange={onWithHeaderChange}
          />

          {validation && !validation.isValid && (
            <div className="border-b border-border px-5 py-3">
              <NoticeVariableValidationPanel validation={validation} />
            </div>
          )}

          <NoticeTemplateVersionDetailTabs
            detailVersion={detailVersion}
            configForm={configForm}
            clientId={clientId}
            typFileNames={typFileNames}
            imageFileNames={imageFileNames}
            configErrors={configErrors}
            typFiles={typFiles}
            imageFiles={imageFiles}
            uploading={uploading}
            savingConfig={savingConfig}
            onConfigFormChange={onConfigFormChange}
            onSaveConfig={onSaveConfig}
            onDuplicateVersion={onDuplicateVersion}
            onTypFilesChange={onTypFilesChange}
            onImageFilesChange={onImageFilesChange}
            onUpload={onUpload}
          />
        </>
      )}
    </div>
  );
}
