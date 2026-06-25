import { NoticeTemplateVersionDetail } from '@/components/notice/NoticeTemplateVersionDetail';
import { NoticeTemplateVersionSidebar } from '@/components/notice/NoticeTemplateVersionSidebar';
import { useNoticeTemplateVersionWorkspace } from '@/hooks/useNoticeTemplateVersionWorkspace';
import type { NoticeTemplate } from '@/types';

interface NoticeTemplateVersionWorkspaceProps {
  template: NoticeTemplate;
  onUpdated: (template: NoticeTemplate) => void;
}

export function NoticeTemplateVersionWorkspace({
  template,
  onUpdated,
}: NoticeTemplateVersionWorkspaceProps) {
  const workspace = useNoticeTemplateVersionWorkspace({ template, onUpdated });

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <NoticeTemplateVersionSidebar
        sortedVersions={workspace.sortedVersions}
        selectedVersion={workspace.selectedVersion}
        activeVersion={workspace.activeVersion}
        creatingVersion={workspace.creatingVersion}
        onSelectVersion={workspace.setSelectedVersion}
        onDuplicateVersion={workspace.handleDuplicateVersion}
      />
      <NoticeTemplateVersionDetail
        selectedVersion={workspace.selectedVersion}
        detailVersion={workspace.detailVersion}
        configForm={workspace.configForm}
        clientId={workspace.clientId}
        isDefault={workspace.isDefault}
        canActivate={workspace.canActivate}
        typFileNames={workspace.typFileNames}
        imageFileNames={workspace.imageFileNames}
        validation={workspace.validation}
        configErrors={workspace.configErrors}
        typFiles={workspace.typFiles}
        imageFiles={workspace.imageFiles}
        creatingVersion={workspace.creatingVersion}
        uploading={workspace.uploading}
        activating={workspace.activating}
        savingConfig={workspace.savingConfig}
        savingLayout={workspace.savingLayout}
        onConfigFormChange={workspace.setConfigForm}
        onWithHeaderChange={workspace.handleWithHeaderChange}
        onSaveConfig={workspace.handleSaveConfig}
        onMarkDefault={workspace.handleMarkDefault}
        onDuplicateVersion={workspace.handleDuplicateVersion}
        onTypFilesChange={workspace.setTypFiles}
        onImageFilesChange={workspace.setImageFiles}
        onUpload={workspace.handleUpload}
      />
    </div>
  );
}
