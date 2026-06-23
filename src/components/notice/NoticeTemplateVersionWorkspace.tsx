import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Copy,
  Star,
  FileText,
  Loader2,
  Image as ImageIcon,
  FileType2,
  Save,
  Sparkles,
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
  useLazyGetNoticeSampleRowQuery,
  fetchNoticeTestPdf,
  fetchNoticeTestPdfFromSpreadsheet,
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
  const [testRowJson, setTestRowJson] = useState('{}');
  const [testingPdf, setTestingPdf] = useState(false);
  const [typFiles, setTypFiles] = useState<File[]>([]);
  const [templateJsonFile, setTemplateJsonFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [testSpreadsheet, setTestSpreadsheet] = useState<File | null>(null);
  const [configForm, setConfigForm] = useState<NoticeConfigFormValues | null>(null);
  const [configErrors, setConfigErrors] = useState<
    Partial<Record<keyof NoticeConfigFormValues, string>>
  >({});

  const [createVersion, { isLoading: creatingVersion }] =
    useCreateNoticeVersionMutation();
  const [uploadFiles, { isLoading: uploading }] =
    useUploadNoticeVersionFilesMutation();
  const [activateVersion, { isLoading: activating }] =
    useActivateNoticeVersionMutation();
  const [updateConfig, { isLoading: savingConfig }] =
    useUpdateNoticeVersionConfigMutation();
  const [updateLayout, { isLoading: savingLayout }] =
    useUpdateNoticeVersionLayoutMutation();
  const [fetchSampleRow, { isFetching: loadingSample }] =
    useLazyGetNoticeSampleRowQuery();

  useEffect(() => {
    if (searchParams.get('version') === selectedVersion) return;
    const next = new URLSearchParams(searchParams);
    next.set('version', selectedVersion);
    setSearchParams(next, { replace: true });
  }, [selectedVersion, searchParams, setSearchParams]);

  const detailVersion = template.versions.find(
    (v) => v.version === selectedVersion,
  );
  const isDraft = detailVersion?.status === 'draft';
  const isActive = detailVersion?.status === 'active';
  const isDefault = template.activeVersion === selectedVersion;
  const canActivate =
    detailVersion &&
    !isDefault &&
    (detailVersion.fileNames.some((f) => f.toLowerCase().endsWith('.typ')) ?? false);

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

  useEffect(() => {
    if (!detailVersion) return;
    setConfigForm(
      noticeConfigToFormValues(
        detailVersion.noticeConfig,
        detailVersion.metadata.description ?? '',
      ),
    );
    setConfigErrors({});
  }, [detailVersion?.version, detailVersion?.updatedAt]);

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
      toast.success('Files uploaded (same filename replaces existing file)');
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

  async function handleWithHeaderChange(with_header: boolean) {
    try {
      const updated = await updateLayout({
        templateId: template._id,
        version: selectedVersion,
        with_header,
      }).unwrap();
      onUpdated(updated);
      toast.success('Header layout updated');
    } catch (err) {
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

  async function handleGenerateSampleRow() {
    try {
      const row = await fetchSampleRow({
        templateId: template._id,
        version: selectedVersion,
      }).unwrap();
      setTestRowJson(JSON.stringify(row, null, 2));
      toast.success('Sample row generated from config');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate sample row'));
    }
  }

  async function handleTestPdf(generateSample = false) {
    setTestingPdf(true);
    try {
      let blob: Blob;
      if (testSpreadsheet) {
        const result = await fetchNoticeTestPdfFromSpreadsheet(
          template._id,
          selectedVersion,
          testSpreadsheet,
        );
        blob = result.blob;
        if (result.rowJson) setTestRowJson(result.rowJson);
      } else if (generateSample) {
        blob = await fetchNoticeTestPdf(template._id, selectedVersion, {
          generateSample: true,
        });
      } else {
        const row = JSON.parse(testRowJson) as Record<string, string>;
        blob = await fetchNoticeTestPdf(template._id, selectedVersion, {
          row,
        });
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Test PDF generation failed',
      );
    } finally {
      setTestingPdf(false);
    }
  }

  const sortedVersions = [...template.versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Versions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateVersion}
            disabled={creatingVersion}
          >
            <Copy className="mr-1 h-3.5 w-3.5" />
            Add version
          </Button>
        </div>

        <ul className="space-y-2">
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

      <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        {detailVersion && configForm && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{selectedVersion}</h2>
                  <NoticeVersionStatusBadge
                    status={detailVersion.status}
                    showDefault={isDefault}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Updated {formatDate(detailVersion.updatedAt)}
                  {detailVersion.metadata.description
                    ? ` · ${detailVersion.metadata.description}`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canActivate && (
                  <Button size="sm" onClick={handleMarkDefault} disabled={activating}>
                    <Star className="mr-1 h-4 w-4" />
                    Mark as default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicateVersion}
                  disabled={creatingVersion}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">With header</p>
                  <p className="text-xs text-muted-foreground">
                    Editable on any version (active, draft, or inactive).
                  </p>
                </div>
                <div className="flex gap-2">
                  {([false, true] as const).map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      disabled={savingLayout}
                      onClick={() => void handleWithHeaderChange(v)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                        detailVersion.noticeConfig.with_header === v
                          ? 'border-primary bg-primary/10 font-medium text-primary'
                          : 'border-border hover:bg-muted/50',
                      )}
                    >
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">id_field: {detailVersion.noticeConfig.id_field}</Badge>
              <Badge variant="outline">
                date: {detailVersion.noticeConfig.date_output_style ?? 'dd-mm-yyyy'}
              </Badge>
              <Badge variant="outline">{typFileNames.length} .typ files</Badge>
              <Badge variant="outline">{imageFileNames.length} images</Badge>
              <Badge variant="outline">
                {detailVersion.metadata.variables.length} variables
              </Badge>
              {(detailVersion.noticeConfig.tables?.length ?? 0) > 0 && (
                <Badge variant="outline">
                  {detailVersion.noticeConfig.tables!.length} tables
                </Badge>
              )}
              {(detailVersion.noticeConfig.list_fields?.length ?? 0) > 0 && (
                <Badge variant="outline">
                  {detailVersion.noticeConfig.list_fields!.length} list fields
                </Badge>
              )}
            </div>

            <NoticeVariableValidationPanel validation={validation} />

            <Tabs defaultValue="config">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="config" className="gap-1.5">
                  Config
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-1.5">
                  <FileType2 className="h-3.5 w-3.5" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="test" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Test PDF
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4 space-y-4">
                {isDraft ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Draft versions allow full config editing including tables and list
                      fields.
                    </p>
                    <NoticeConfigForm
                      values={configForm}
                      onChange={setConfigForm}
                      clientId={template.clientId}
                      errors={configErrors}
                      showWithHeader={false}
                    />
                    <Button onClick={handleSaveConfig} disabled={savingConfig}>
                      {savingConfig ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-4 w-4" />
                      )}
                      Save configuration
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {isActive
                        ? 'Active versions are read-only for full config. Duplicate to edit, or use the header toggle above.'
                        : 'Inactive versions are read-only. Duplicate to edit full config.'}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ConfigRow label="Notice ID" value={detailVersion.noticeConfig.notice_id} />
                      <ConfigRow
                        label="Notice name"
                        value={detailVersion.noticeConfig.notice_name}
                      />
                      <ConfigRow
                        label="Sort field"
                        value={detailVersion.noticeConfig.sort_field ?? '—'}
                      />
                      <ConfigRow
                        label="Max rows"
                        value={String(detailVersion.noticeConfig.max_rows ?? 20)}
                      />
                      <ConfigRow
                        label="Date input"
                        value={detailVersion.noticeConfig.date_input_format ?? '%Y-%m-%d'}
                      />
                      <ConfigRow
                        label="Date output"
                        value={detailVersion.noticeConfig.date_output_style ?? 'dd-mm-yyyy'}
                      />
                      {detailVersion.noticeConfig.rotation ? (
                        <ConfigRow label="Rotation" value="Enabled" />
                      ) : null}
                    </div>
                    {detailVersion.noticeConfig.file_name?.length ? (
                      <FieldChipList
                        label="File name columns"
                        items={detailVersion.noticeConfig.file_name}
                      />
                    ) : null}
                    {detailVersion.noticeConfig.variable_fields?.length ? (
                      <FieldChipList
                        label="Variable fields"
                        items={detailVersion.noticeConfig.variable_fields}
                      />
                    ) : null}
                    {detailVersion.noticeConfig.date_fields?.length ? (
                      <FieldChipList
                        label="Date fields"
                        items={detailVersion.noticeConfig.date_fields}
                      />
                    ) : null}
                    {detailVersion.noticeConfig.decimal_fields?.length ? (
                      <FieldChipList
                        label="Decimal fields"
                        items={detailVersion.noticeConfig.decimal_fields}
                      />
                    ) : null}
                    {(detailVersion.noticeConfig.tables?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Tables</p>
                        {detailVersion.noticeConfig.tables!.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-lg border border-border px-3 py-2 text-xs"
                          >
                            <span className="font-medium">{t.id}</span>
                            {' · '}
                            {t.columns.length} columns
                          </div>
                        ))}
                      </div>
                    )}
                    {(detailVersion.noticeConfig.list_fields?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">List fields</p>
                        {detailVersion.noticeConfig.list_fields!.map((l) => (
                          <div
                            key={l.placeholder}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-mono"
                          >
                            {l.field_name} → {l.placeholder}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="templates" className="mt-4 space-y-4">
                {typFileNames.length > 0 && (
                  <FileList title="Uploaded templates" files={typFileNames} />
                )}
                {isDraft ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Re-uploading a file with the same name replaces the existing file.
                    </p>
                    <FileDropZone
                      accept=".typ"
                      acceptLabel=".typ template files"
                      files={typFiles}
                      onFilesChange={setTypFiles}
                    />
                    <div>
                      <p className="mb-2 text-sm font-medium">template.json (optional)</p>
                      <FileDropZone
                        accept=".json"
                        acceptLabel="State/language mapping"
                        files={templateJsonFile ? [templateJsonFile] : []}
                        onFilesChange={(f) => setTemplateJsonFile(f[0] ?? null)}
                        multiple={false}
                      />
                    </div>
                    <Button
                      disabled={uploading || (!typFiles.length && !templateJsonFile)}
                      onClick={() =>
                        void handleUpload([
                          ...typFiles,
                          ...(templateJsonFile ? [templateJsonFile] : []),
                        ])
                      }
                    >
                      {uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                      Save template files
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only draft versions accept file uploads. Duplicate this version to edit
                    templates.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="images" className="mt-4 space-y-4">
                {imageFileNames.length > 0 && (
                  <FileList title="Uploaded images" files={imageFileNames} />
                )}
                {isDraft ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Re-uploading an image with the same name replaces the existing file.
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
                      {uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                      Save images
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only draft versions accept file uploads. Duplicate this version to edit
                    images.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="test" className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a test PDF using sample data, JSON row data, or an Excel/CSV file
                  (first row is used by default).
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSampleRow}
                    disabled={loadingSample}
                  >
                    {loadingSample ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-4 w-4" />
                    )}
                    Auto-generate sample row
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleTestPdf(true)}
                    disabled={testingPdf || !detailVersion.fileNames.length}
                  >
                    {testingPdf ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-1 h-4 w-4" />
                    )}
                    Generate with sample data
                  </Button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Or upload Excel / CSV</p>
                  <FileDropZone
                    accept=".xlsx,.xls,.csv"
                    acceptLabel="Excel or CSV"
                    files={testSpreadsheet ? [testSpreadsheet] : []}
                    onFilesChange={(f) => setTestSpreadsheet(f[0] ?? null)}
                    multiple={false}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Test row JSON</p>
                  <textarea
                    value={testRowJson}
                    onChange={(e) => setTestRowJson(e.target.value)}
                    rows={10}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => void handleTestPdf(false)}
                  disabled={testingPdf || !detailVersion.fileNames.length}
                >
                  {testingPdf ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-1 h-4 w-4" />
                  )}
                  Generate test PDF
                </Button>
              </TabsContent>
            </Tabs>
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
          <span className="font-mono text-sm font-medium">{version.version}</span>
          {isDefault && (
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <NoticeVersionStatusBadge
            status={version.status}
            showDefault={isDefault}
            className="text-[10px]"
          />
          <span className="text-[10px] text-muted-foreground">
            {formatDate(version.updatedAt)}
          </span>
        </div>
      </button>
    </li>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function FieldChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FileList({ title, files }: { title: string; files: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="rounded-lg border border-border divide-y divide-border text-xs font-mono">
        {files.map((f) => (
          <li key={f} className="px-3 py-2 text-muted-foreground">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
