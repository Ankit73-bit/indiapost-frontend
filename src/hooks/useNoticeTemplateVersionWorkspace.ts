import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useCreateNoticeVersionMutation,
  useUploadNoticeVersionFilesMutation,
  useActivateNoticeVersionMutation,
  useUpdateNoticeVersionConfigMutation,
  useUpdateNoticeVersionLayoutMutation,
} from '@/store/api/noticeTemplatesApi';
import type { NoticeTemplate } from '@/types';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import {
  formValuesToNoticeConfig,
  noticeConfigToFormValues,
  validateNoticeConfigForm,
  type NoticeConfigFormValues,
} from '@/lib/noticeConfig';
import { validateVariablesAgainstConfig } from '@/lib/noticeConfigValidation';

interface UseNoticeTemplateVersionWorkspaceOptions {
  template: NoticeTemplate;
  onUpdated: (template: NoticeTemplate) => void;
}

export function useNoticeTemplateVersionWorkspace({
  template,
  onUpdated,
}: UseNoticeTemplateVersionWorkspaceOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const versionFromUrl = searchParams.get('version');

  const [selectedVersion, setSelectedVersion] = useState(
    versionFromUrl ??
      template.activeVersion ??
      template.versions[template.versions.length - 1]?.version ??
      'v1',
  );
  const [typFiles, setTypFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [configForm, setConfigForm] = useState<NoticeConfigFormValues | null>(null);
  const [configErrors, setConfigErrors] = useState<
    Partial<Record<keyof NoticeConfigFormValues, string>>
  >({});

  const [createVersion, { isLoading: creatingVersion }] = useCreateNoticeVersionMutation();
  const [uploadFiles, { isLoading: uploading }] = useUploadNoticeVersionFilesMutation();
  const [activateVersion, { isLoading: activating }] = useActivateNoticeVersionMutation();
  const [updateConfig, { isLoading: savingConfig }] = useUpdateNoticeVersionConfigMutation();
  const [updateLayout, { isLoading: savingLayout }] = useUpdateNoticeVersionLayoutMutation();

  // Keep URL in sync with selected version
  useEffect(() => {
    if (searchParams.get('version') === selectedVersion) return;
    const next = new URLSearchParams(searchParams);
    next.set('version', selectedVersion);
    setSearchParams(next, { replace: true });
  }, [selectedVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const detailVersion = template.versions.find((v) => v.version === selectedVersion);
  const isDefault = template.activeVersion === selectedVersion;
  const canActivate =
    detailVersion &&
    !isDefault &&
    detailVersion.fileNames.some((f) => f.toLowerCase().endsWith('.typ'));

  const typFileNames =
    detailVersion?.fileNames.filter((f) => f.toLowerCase().endsWith('.typ')) ?? [];
  const imageFileNames =
    detailVersion?.fileNames.filter((f) => /\.(png|jpe?g|webp)$/i.test(f)) ?? [];

  const validation = useMemo(() => {
    if (!detailVersion) return null;
    return validateVariablesAgainstConfig(
      detailVersion.noticeConfig,
      detailVersion.metadata.variables,
    );
  }, [detailVersion]);

  // Re-init form whenever the selected version or its data changes
  useEffect(() => {
    if (!detailVersion) return;
    setConfigForm(
      noticeConfigToFormValues(
        detailVersion.noticeConfig,
        detailVersion.metadata.description ?? '',
      ),
    );
    setConfigErrors({});
  }, [detailVersion?.version, detailVersion?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(files: File[]) {
    if (!files.length) return;
    try {
      const updated = await uploadFiles({
        templateId: template._id,
        version: selectedVersion,
        files,
      }).unwrap();
      onUpdated(updated);
      setTypFiles([]);
      setImageFiles([]);
      toast.success('Files uploaded — same filename replaces existing file');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    }
  }

  async function handleMarkDefault() {
    try {
      const updated = await activateVersion({
        templateId: template._id,
        version: selectedVersion,
      }).unwrap();
      onUpdated(updated);
      toast.success(`${selectedVersion} marked as default`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark as default'));
    }
  }

  async function handleDuplicateVersion() {
    try {
      const updated = await createVersion({
        templateId: template._id,
        cloneFromVersion: selectedVersion,
        description: `Duplicated from ${selectedVersion}`,
      }).unwrap();
      onUpdated(updated);
      const latest = updated.versions[updated.versions.length - 1];
      if (latest) setSelectedVersion(latest.version);
      toast.success('New draft version created');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to duplicate version'));
    }
  }

  // with_header lives inside noticeConfig — save via the layout PATCH endpoint
  // and also keep configForm in sync so a subsequent "Save config" doesn't clobber it.
  async function handleWithHeaderChange(with_header: boolean) {
    if (!configForm) return;
    const prev = configForm;
    setConfigForm({ ...configForm, with_header });
    try {
      const updated = await updateLayout({
        templateId: template._id,
        version: selectedVersion,
        with_header,
      }).unwrap();
      onUpdated(updated);
      toast.success(`Header ${with_header ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setConfigForm(prev); // revert on failure
      toast.error(getApiErrorMessage(err, 'Failed to update header setting'));
    }
  }

  async function handleSaveConfig() {
    if (!configForm) return;
    const errors = validateNoticeConfigForm(configForm, template.clientId);
    if (Object.keys(errors).length) {
      setConfigErrors(errors);
      toast.error('Fix validation errors before saving');
      return;
    }
    try {
      const updated = await updateConfig({
        templateId: template._id,
        version: selectedVersion,
        noticeConfig: formValuesToNoticeConfig(configForm),
      }).unwrap();
      onUpdated(updated);
      toast.success('Configuration saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save configuration'));
    }
  }

  const sortedVersions = [...template.versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );

  return {
    sortedVersions,
    activeVersion: template.activeVersion,
    clientId: template.clientId,
    selectedVersion,
    setSelectedVersion,
    detailVersion,
    configForm,
    setConfigForm,
    configErrors,
    isDefault,
    canActivate,
    typFileNames,
    imageFileNames,
    validation,
    typFiles,
    setTypFiles,
    imageFiles,
    setImageFiles,
    creatingVersion,
    uploading,
    activating,
    savingConfig,
    savingLayout,
    handleUpload,
    handleMarkDefault,
    handleDuplicateVersion,
    handleWithHeaderChange,
    handleSaveConfig,
  };
}
