import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Copy,
  Star,
  Loader2,
  Image as ImageIcon,
  FileType2,
  Save,
  Settings2,
} from 'lucide-react';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeConfigForm } from '@/components/notice/NoticeConfigForm';
import { NoticeVariableValidationPanel } from '@/components/notice/NoticeVariableValidationPanel';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  useCreateNoticeVersionMutation,
  useUploadNoticeVersionFilesMutation,
  useActivateNoticeVersionMutation,
  useUpdateNoticeVersionConfigMutation,
  useUpdateNoticeVersionLayoutMutation,
  useGetNoticeVersionValidationQuery,
} from '@/store/api/noticeTemplatesApi';
import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';
import { toast } from '@/lib/toast';
import { formatDate, getApiErrorMessage } from '@/lib/helpers';
import {
  formValuesToNoticeConfig,
  noticeConfigToFormValues,
  validateNoticeConfigForm,
  type NoticeConfigFormValues,
} from '@/lib/noticeConfig';
import { validateVariablesAgainstConfig } from '@/lib/noticeConfigValidation';
import { cn } from '@/lib/utils';

interface NoticeTemplateVersionWorkspaceProps {
  template: NoticeTemplate;
  onUpdated: (template: NoticeTemplate) => void;
}

export function NoticeTemplateVersionWorkspace({
  template,
  onUpdated,
}: NoticeTemplateVersionWorkspaceProps) {
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

  const { data: serverValidation } = useGetNoticeVersionValidationQuery(
    { templateId: template._id, version: selectedVersion },
    { skip: !detailVersion },
  );

  const validation = useMemo(() => {
    if (serverValidation) return serverValidation;
    if (!detailVersion) return null;
    return validateVariablesAgainstConfig(
      detailVersion.noticeConfig,
      detailVersion.metadata.variables,
    );
  }, [serverValidation, detailVersion]);

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
      setTemplateJsonFile(null);
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

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* ── Version sidebar ── */}
      <aside className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Versions
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDuplicateVersion()}
            disabled={creatingVersion}
          >
            {creatingVersion ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            New version
          </Button>
        </div>

        <ul className="space-y-1.5">
          {sortedVersions.map((v) => (
            <VersionListItem
              key={v.version}
              version={v}
              isSelected={v.version === selectedVersion}
              isDefault={template.activeVersion === v.version}
              onSelect={() => setSelectedVersion(v.version)}
            />
          ))}
        </ul>
      </aside>

      {/* ── Version detail panel ── */}
      <div className="min-w-0 rounded-xl border border-border bg-card">
        {!detailVersion || !configForm ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Version header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-semibold">{selectedVersion}</span>
                  <NoticeVersionStatusBadge
                    status={detailVersion.status}
                    showDefault={isDefault}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Updated {formatDate(detailVersion.updatedAt)}
                  {detailVersion.metadata.description
                    ? ` · ${detailVersion.metadata.description}`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canActivate && (
                  <Button size="sm" onClick={() => void handleMarkDefault()} disabled={activating}>
                    {activating ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="mr-1 h-4 w-4" />
                    )}
                    Set as default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDuplicateVersion()}
                  disabled={creatingVersion}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </div>

            {/* Meta strip + with_header toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="font-mono text-[11px]">
                  id: {detailVersion.noticeConfig.id_field}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {detailVersion.noticeConfig.date_output_style ?? 'dd-mm-yyyy'}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {typFileNames.length} .typ
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {imageFileNames.length} img
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {detailVersion.metadata.variables.length} vars
                </Badge>
                {(detailVersion.noticeConfig.tables?.length ?? 0) > 0 && (
                  <Badge variant="outline" className="text-[11px]">
                    {detailVersion.noticeConfig.tables!.length} tables
                  </Badge>
                )}
                {(detailVersion.noticeConfig.list_fields?.length ?? 0) > 0 && (
                  <Badge variant="outline" className="text-[11px]">
                    {detailVersion.noticeConfig.list_fields!.length} lists
                  </Badge>
                )}
              </div>

              {/* with_header — always editable on any version status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Header</span>
                <div className="flex overflow-hidden rounded-md border border-border">
                  {([false, true] as const).map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      disabled={savingLayout}
                      onClick={() => void handleWithHeaderChange(v)}
                      className={cn(
                        'px-3 py-1 text-xs transition-colors',
                        configForm.with_header === v
                          ? 'bg-primary font-medium text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted/60',
                      )}
                    >
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
                {savingLayout && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Validation panel (only when there's something to show) */}
            {validation && !validation.isValid && (
              <div className="border-b border-border px-5 py-3">
                <NoticeVariableValidationPanel validation={validation} />
              </div>
            )}

            {/* Tabs */}
            <div className="px-5 pb-6 pt-2">
              <Tabs defaultValue="config">
                <TabsList className="mb-4 h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
                  {(
                    [
                      { value: 'config', label: 'Config', icon: Settings2 },
                      { value: 'templates', label: 'Templates', icon: FileType2 },
                      { value: 'images', label: 'Images', icon: ImageIcon },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Config tab — editable on any version status ── */}
                <TabsContent value="config" className="mt-0 space-y-4">
                  {detailVersion.status !== 'draft' && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                      This version is <strong>{detailVersion.status}</strong>. Config edits apply immediately —{' '}
                      <button
                        type="button"
                        className="font-medium underline underline-offset-2"
                        onClick={() => void handleDuplicateVersion()}
                      >
                        duplicate first
                      </button>{' '}
                      if you want to keep a snapshot.
                    </div>
                  )}
                  <NoticeConfigForm
                    values={configForm}
                    onChange={setConfigForm}
                    clientId={template.clientId}
                    errors={configErrors}
                    showWithHeader={false}
                  />
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => void handleSaveConfig()} disabled={savingConfig}>
                      {savingConfig ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1.5 h-4 w-4" />
                      )}
                      Save configuration
                    </Button>
                  </div>
                </TabsContent>

                {/* ── Templates tab ── */}
                <TabsContent value="templates" className="mt-0 space-y-4">
                  {typFileNames.length > 0 && (
                    <FileList title="Uploaded .typ files" files={typFileNames} />
                  )}
                  {detailVersion.status === 'draft' ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Uploading a file with the same name replaces the existing one.
                      </p>
                      <FileDropZone
                        accept=".typ"
                        acceptLabel=".typ template files"
                        files={typFiles}
                        onFilesChange={setTypFiles}
                      />
                      <Button
                        disabled={uploading || !typFiles.length}
                        onClick={() => void handleUpload(typFiles)}
                      >
                        {uploading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Upload files
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                      File uploads are only allowed on draft versions.{' '}
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => void handleDuplicateVersion()}
                      >
                        Duplicate this version
                      </button>{' '}
                      to edit templates.
                    </div>
                  )}
                </TabsContent>

                {/* ── Images tab ── */}
                <TabsContent value="images" className="mt-0 space-y-4">
                  {imageFileNames.length > 0 && (
                    <FileList title="Uploaded images" files={imageFileNames} />
                  )}
                  {detailVersion.status === 'draft' ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Logos, signatures, and assets referenced by your .typ files.
                        Uploading the same name replaces the existing file.
                      </p>
                      <FileDropZone
                        accept=".png,.jpg,.jpeg,.webp,image/*"
                        acceptLabel="PNG, JPG, WEBP"
                        files={imageFiles}
                        onFilesChange={setImageFiles}
                        icon="image"
                      />
                      <Button
                        disabled={uploading || !imageFiles.length}
                        onClick={() => void handleUpload(imageFiles)}
                      >
                        {uploading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Upload images
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                      File uploads are only allowed on draft versions.{' '}
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => void handleDuplicateVersion()}
                      >
                        Duplicate this version
                      </button>{' '}
                      to edit images.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VersionListItem({
  version,
  isSelected,
  isDefault,
  onSelect,
}: {
  version: NoticeTemplateVersion;
  isSelected: boolean;
  isDefault: boolean;
  onSelect: () => void;
}) {
  const typCount = version.fileNames.filter((f) => f.endsWith('.typ')).length;
  const imgCount = version.fileNames.filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).length;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
          isSelected
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
            : 'border-border hover:bg-muted/40',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold">{version.version}</span>
          {isDefault && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <NoticeVersionStatusBadge
            status={version.status}
            showDefault={isDefault}
            className="text-[10px]"
          />
          <span className="tabular-nums text-[10px] text-muted-foreground">
            {formatDate(version.updatedAt)}
          </span>
        </div>
        {version.fileNames.length > 0 && (
          <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
            {typCount} .typ · {imgCount} img
          </p>
        )}
      </button>
    </li>
  );
}

function FileList({ title, files }: { title: string; files: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {files.map((f) => (
          <li key={f} className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
