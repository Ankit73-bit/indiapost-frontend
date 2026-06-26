import { useEffect, useMemo, useState } from 'react';
import {
  useCreateNoticeConfigMutation,
  useDeleteNoticeConfigMutation,
  useGetNoticeConfigQuery,
  useLinkNoticeConfigTemplateMutation,
  useUnlinkNoticeConfigTemplateMutation,
  useUpdateNoticeConfigMutation,
} from '@/store/api/noticeConfigsApi';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import {
  emptyNoticeConfigForm,
  formValuesToNoticeConfig,
  noticeConfigToFormValues,
  parseUploadedConfigFile,
  readJsonFile,
  validateNoticeConfigForm,
  type NoticeConfigFormValues,
} from '@/lib/noticeConfig';
import { validateVariablesAgainstConfig } from '@/lib/noticeConfigValidation';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import { DEFAULT_CONFIG_FILE_NAME } from '@/components/notice/editor/editorUtils';
import type {
  NoticeConfigEditorProps,
  NoticeConfigFormErrors,
} from '@/pages/notice/noticeConfigPage.types';

export function useNoticeConfigEditor({
  clientId,
  configId,
  templates,
  onCreated,
  onDeleted,
}: Pick<
  NoticeConfigEditorProps,
  'clientId' | 'configId' | 'templates' | 'onCreated' | 'onDeleted'
>) {
  const isNew = !configId;
  const { data: record, isLoading } = useGetNoticeConfigQuery(configId!, {
    skip: !configId,
  });

  const [formValues, setFormValues] = useState<NoticeConfigFormValues>(
    emptyNoticeConfigForm(),
  );
  const [configFileName, setConfigFileName] = useState(DEFAULT_CONFIG_FILE_NAME);
  const [formErrors, setFormErrors] = useState<NoticeConfigFormErrors>({});
  const [linkTemplateId, setLinkTemplateId] = useState('');

  const [createConfig, { isLoading: creating }] = useCreateNoticeConfigMutation();
  const [updateConfig, { isLoading: saving }] = useUpdateNoticeConfigMutation();
  const [deleteConfig, { isLoading: deleting }] = useDeleteNoticeConfigMutation();
  const [linkTemplate, { isLoading: linking }] =
    useLinkNoticeConfigTemplateMutation();
  const [unlinkTemplate, { isLoading: unlinking }] =
    useUnlinkNoticeConfigTemplateMutation();

  useEffect(() => {
    if (isNew) {
      setFormValues(emptyNoticeConfigForm());
      setConfigFileName(DEFAULT_CONFIG_FILE_NAME);
      setLinkTemplateId('');
      setFormErrors({});
      return;
    }
    if (!record) return;
    setFormValues(
      noticeConfigToFormValues(record.config, record.description ?? ''),
    );
    setConfigFileName(record.configFileName || DEFAULT_CONFIG_FILE_NAME);
    setLinkTemplateId(record.linkedTemplateId ?? '');
    setFormErrors({});
  }, [isNew, record?._id, record?.updatedAt]);

  const { data: linkedTemplateDetail } = useGetNoticeTemplateQuery(
    record?.linkedTemplateId ?? '',
    { skip: !record?.linkedTemplateId },
  );

  const linkedTemplate = useMemo(
    () => templates.find((t) => t._id === record?.linkedTemplateId),
    [templates, record?.linkedTemplateId],
  );

  const validation = useMemo(() => {
    if (!record || !linkedTemplateDetail) return null;
    const version =
      linkedTemplateDetail.versions.find(
        (v) => v.version === linkedTemplateDetail.activeVersion,
      ) ?? linkedTemplateDetail.versions[linkedTemplateDetail.versions.length - 1];
    if (!version) return null;
    return validateVariablesAgainstConfig(
      record.config,
      version.metadata.variables,
    );
  }, [record, linkedTemplateDetail]);

  async function handleUpload(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    try {
      const raw = await readJsonFile(file);
      const { form } = parseUploadedConfigFile(raw);
      setFormValues(form);
      setConfigFileName(
        file.name.endsWith('.json') ? file.name : DEFAULT_CONFIG_FILE_NAME,
      );
      toast.success('Config loaded from file');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid config file');
    }
  }

  async function handleSave() {
    const errors = validateNoticeConfigForm(formValues, clientId);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error('Fix validation errors before saving');
      return;
    }

    const config = formValuesToNoticeConfig(formValues);
    try {
      if (isNew) {
        const created = await createConfig({
          clientId,
          config,
          configFileName,
          description: formValues.description || undefined,
          linkedTemplateId: linkTemplateId || undefined,
        }).unwrap();
        toast.success('Config created');
        onCreated?.(created._id);
      } else {
        await updateConfig({
          configId: configId!,
          config,
          configFileName,
          description: formValues.description || undefined,
        }).unwrap();
        toast.success('Config saved');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save config'));
    }
  }

  async function handleLink() {
    if (!configId || !linkTemplateId) return;
    try {
      await linkTemplate({ configId, templateId: linkTemplateId }).unwrap();
      toast.success('Config linked to template');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to link template'));
    }
  }

  async function handleUnlink() {
    if (!configId) return;
    try {
      await unlinkTemplate(configId).unwrap();
      setLinkTemplateId('');
      toast.success('Template unlinked');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to unlink template'));
    }
  }

  async function handleDelete() {
    if (!configId) return;
    if (!window.confirm('Delete this config? This cannot be undone.')) return;
    try {
      await deleteConfig(configId).unwrap();
      toast.success('Config deleted');
      onDeleted?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete config'));
    }
  }

  return {
    isNew,
    isLoading,
    record,
    formValues,
    setFormValues,
    formErrors,
    configFileName,
    setConfigFileName,
    linkTemplateId,
    setLinkTemplateId,
    linkedTemplate,
    validation,
    creating,
    saving,
    deleting,
    linking,
    unlinking,
    handleUpload,
    handleSave,
    handleLink,
    handleUnlink,
    handleDelete,
  };
}
