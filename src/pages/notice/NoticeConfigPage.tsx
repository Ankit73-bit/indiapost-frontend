import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ExternalLink,
  FileJson,
  Loader2,
  Plus,
  Save,
  Trash2,
  Unlink,
} from 'lucide-react';
import { NoticeConfigForm } from '@/components/notice/NoticeConfigForm';
import { NoticeVariableValidationPanel } from '@/components/notice/NoticeVariableValidationPanel';
import { TableShell } from '@/components/shared/TableShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import {
  useCreateNoticeConfigMutation,
  useDeleteNoticeConfigMutation,
  useGetNoticeConfigQuery,
  useLinkNoticeConfigTemplateMutation,
  useListNoticeConfigsQuery,
  useUnlinkNoticeConfigTemplateMutation,
  useUpdateNoticeConfigMutation,
} from '@/store/api/noticeConfigsApi';
import {
  useListNoticeTemplatesQuery,
  useGetNoticeTemplateQuery,
} from '@/store/api/noticeTemplatesApi';
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
import { formatDate, getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import { DEFAULT_CONFIG_FILE_NAME } from '@/components/notice/editor/editorUtils';
import { cn } from '@/lib/utils';
import { FileDropZone } from '@/components/notice/FileDropZone';

export function NoticeConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('configId');
  const { clientId, isAdmin, selectedClient } = useNoticeClientContext();
  const [isCreating, setIsCreating] = useState(false);

  const { data: listData, isLoading: listLoading } = useListNoticeConfigsQuery(
    { clientId, page: 1, limit: 50 },
    { skip: !clientId },
  );

  const { data: templatesData } = useListNoticeTemplatesQuery(
    { clientId, page: 1, limit: 100 },
    { skip: !clientId },
  );

  const configs = listData?.data ?? [];
  const templates = templatesData?.data ?? [];

  useEffect(() => {
    if (!selectedId && configs.length && !isCreating) {
      const next = new URLSearchParams(searchParams);
      next.set('configId', configs[0]!._id);
      setSearchParams(next, { replace: true });
    }
  }, [configs, selectedId, isCreating, searchParams, setSearchParams]);

  function selectConfig(id: string) {
    const next = new URLSearchParams(searchParams);
    next.set('configId', id);
    setSearchParams(next, { replace: true });
    setIsCreating(false);
  }

  function startCreate() {
    setIsCreating(true);
    const next = new URLSearchParams(searchParams);
    next.delete('configId');
    setSearchParams(next, { replace: true });
  }

  const editorUrl = (templateId: string) =>
    isAdmin && clientId
      ? `/notice-generator/templates/${templateId}/editor?clientId=${clientId}`
      : `/notice-generator/templates/${templateId}/editor`;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <div className="w-full shrink-0 lg:w-[300px]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Config</h2>
            <p className="text-xs text-muted-foreground">
              {selectedClient ? selectedClient.name : 'Select a client'}
            </p>
          </div>
          <Button size="sm" disabled={!clientId} onClick={startCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New
          </Button>
        </div>

        <TableShell>
          {!clientId ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Select a client to manage configs.
            </p>
          ) : listLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : configs.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No configs yet. Create one to get started.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {configs.map((config) => (
                <button
                  key={config._id}
                  type="button"
                  onClick={() => selectConfig(config._id)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-muted/40',
                    selectedId === config._id && !isCreating && 'bg-muted/60',
                  )}
                >
                  <p className="truncate text-sm font-medium">{config.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {config.noticeId}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {config.linkedTemplateId ? 'Linked to template' : 'Unlinked'} ·{' '}
                    {formatDate(config.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </TableShell>
      </div>

      <div className="min-w-0 flex-1">
        {isCreating ? (
          <NoticeConfigEditor
            clientId={clientId}
            templates={templates}
            onCreated={(id) => {
              setIsCreating(false);
              selectConfig(id);
            }}
            onCancel={() => {
              setIsCreating(false);
              if (configs[0]) selectConfig(configs[0]._id);
            }}
            editorUrl={editorUrl}
          />
        ) : selectedId ? (
          <NoticeConfigEditor
            clientId={clientId}
            configId={selectedId}
            templates={templates}
            editorUrl={editorUrl}
            onDeleted={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('configId');
              setSearchParams(next, { replace: true });
            }}
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

function NoticeConfigEditor({
  clientId,
  configId,
  templates,
  onCreated,
  onCancel,
  onDeleted,
  editorUrl,
}: {
  clientId: string;
  configId?: string;
  templates: Array<{ _id: string; noticeName: string; noticeId: string; linkedConfigId?: string }>;
  onCreated?: (id: string) => void;
  onCancel?: () => void;
  onDeleted?: () => void;
  editorUrl: (templateId: string) => string;
}) {
  const isNew = !configId;
  const { data: record, isLoading } = useGetNoticeConfigQuery(configId!, {
    skip: !configId,
  });

  const [formValues, setFormValues] = useState<NoticeConfigFormValues>(
    emptyNoticeConfigForm(),
  );
  const [configFileName, setConfigFileName] = useState(DEFAULT_CONFIG_FILE_NAME);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof NoticeConfigFormValues, string>>
  >({});
  const [linkTemplateId, setLinkTemplateId] = useState<string>('');

  const [createConfig, { isLoading: creating }] = useCreateNoticeConfigMutation();
  const [updateConfig, { isLoading: saving }] = useUpdateNoticeConfigMutation();
  const [deleteConfig, { isLoading: deleting }] = useDeleteNoticeConfigMutation();
  const [linkTemplate, { isLoading: linking }] =
    useLinkNoticeConfigTemplateMutation();
  const [unlinkTemplate, { isLoading: unlinking }] =
    useUnlinkNoticeConfigTemplateMutation();

  useEffect(() => {
    if (!record) return;
    setFormValues(
      noticeConfigToFormValues(record.config, record.description ?? ''),
    );
    setConfigFileName(record.configFileName || DEFAULT_CONFIG_FILE_NAME);
    setLinkTemplateId(record.linkedTemplateId ?? '');
    setFormErrors({});
  }, [record?._id, record?.updatedAt]);

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
      setConfigFileName(file.name.endsWith('.json') ? file.name : DEFAULT_CONFIG_FILE_NAME);
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

  if (!isNew && isLoading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            {isNew ? 'New config' : record?.name}
          </h3>
          {!isNew && (
            <p className="font-mono text-xs text-muted-foreground">{record?.noticeId}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isNew && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button
            type="button"
            disabled={creating || saving}
            onClick={() => void handleSave()}
          >
            {(creating || saving) && (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-1.5 h-4 w-4" />
            {isNew ? 'Create config' : 'Save config'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted p-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium">Template link</p>
              <p className="text-xs text-muted-foreground">
                Link this config to a template. The JSON file is written into the
                template draft when linked or saved.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Select
                value={linkTemplateId || '__none__'}
                onValueChange={(v) => setLinkTemplateId(v === '__none__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.noticeName} ({t.noticeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isNew && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!linkTemplateId || linking}
                    onClick={() => void handleLink()}
                  >
                    Link
                  </Button>
                  {record?.linkedTemplateId && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={unlinking}
                      onClick={() => void handleUnlink()}
                    >
                      <Unlink className="mr-1.5 h-4 w-4" />
                      Unlink
                    </Button>
                  )}
                </div>
              )}
            </div>

            {linkedTemplate && record?.linkedTemplateId && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Linked template:</span>
                <Link
                  to={editorUrl(linkedTemplate._id)}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {linkedTemplate.noticeName}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cfg-file-name">Config JSON file name</Label>
              <Input
                id="cfg-file-name"
                value={configFileName}
                onChange={(e) => setConfigFileName(e.target.value)}
                placeholder={DEFAULT_CONFIG_FILE_NAME}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {isNew && (
        <FileDropZone
          accept=".json,application/json"
          acceptLabel="JSON config"
          files={[]}
          multiple={false}
          onFilesChange={(files) => {
            if (files[0]) void handleUpload([files[0]]);
          }}
          emptyHint="Upload an existing config JSON to pre-fill the form"
        />
      )}

      <NoticeConfigForm
        values={formValues}
        onChange={setFormValues}
        clientId={clientId}
        errors={formErrors}
      />

      {validation && <NoticeVariableValidationPanel validation={validation} />}
    </div>
  );
}
