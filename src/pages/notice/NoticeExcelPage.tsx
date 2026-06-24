import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { NoticeVariableValidationPanel } from '@/components/notice/NoticeVariableValidationPanel';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
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
import { getApiErrorMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';
import {
  fetchNoticeBatchPdf,
  useGetNoticeVersionValidationQuery,
  useListNoticeTemplatesQuery,
} from '@/store/api/noticeTemplatesApi';
import type { NoticeConfig, NoticeTemplate } from '@/types';

type PageStage = 'form' | 'generating' | 'done' | 'error';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv') ||
    file.type.includes('spreadsheet') ||
    file.type.includes('excel') ||
    file.type === 'text/csv'
  );
}

function getActiveVersion(template: NoticeTemplate): string | undefined {
  return (
    template.activeVersion ??
    template.versions.find((v) => v.status === 'active')?.version
  );
}

function getVersionConfig(
  template: NoticeTemplate | undefined,
  versionLabel: string,
): NoticeConfig | undefined {
  return template?.versions.find((v) => v.version === versionLabel)?.noticeConfig;
}

function collectExpectedColumns(config: NoticeConfig): {
  required: string[];
  optional: string[];
} {
  const required = new Set<string>();
  const optional = new Set<string>();

  if (config.id_field) required.add(config.id_field);
  if (config.sort_field) optional.add(config.sort_field);
  for (const field of config.variable_fields ?? []) optional.add(field);
  for (const field of config.date_fields ?? []) optional.add(field);
  for (const field of config.decimal_fields ?? []) optional.add(field);
  for (const field of config.file_name ?? []) optional.add(field);
  for (const list of config.list_fields ?? []) optional.add(list.field_name);
  for (const table of config.tables ?? []) {
    optional.add(table.id_column);
    for (const col of table.columns) optional.add(col.name);
    if (config.rotation) {
      const max = config.max_rows ?? 20;
      for (let i = 1; i <= max; i++) {
        optional.add(`${table.id_column}_${i}`);
        for (const col of table.columns) optional.add(`${col.name}_${i}`);
      }
    }
  }
  if (config.password_field) optional.add(config.password_field);

  for (const field of required) optional.delete(field);

  return {
    required: [...required],
    optional: [...optional].sort((a, b) => a.localeCompare(b)),
  };
}

function ExcelDropZone({
  file,
  onFile,
  disabled,
}: {
  file: File | null;
  onFile: (f: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && isExcelFile(dropped)) onFile(dropped);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-50',
        file && 'bg-muted/20',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && isExcelFile(f)) onFile(f);
          e.target.value = '';
        }}
      />

      {file ? (
        <>
          <div className="rounded-full bg-primary/10 p-3">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <p className="text-xs text-muted-foreground">Click to replace</p>
        </>
      ) : (
        <>
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop your Excel file here</p>
            <p className="text-xs text-muted-foreground">
              .xlsx, .xls, or .csv · first row = headers
            </p>
          </div>
          <Button variant="outline" size="sm" type="button" tabIndex={-1}>
            Browse file
          </Button>
        </>
      )}
    </div>
  );
}

function ColumnRequirements({ config }: { config: NoticeConfig }) {
  const { required, optional } = collectExpectedColumns(config);

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
        Excel column mapping
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Header row column names must match config field names exactly (case-sensitive).
      </p>
      {required.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-foreground">Required</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {required.map((col) => (
              <code
                key={col}
                className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[11px] text-foreground"
              >
                {col}
              </code>
            ))}
          </div>
        </div>
      )}
      {optional.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-foreground">
            Placeholders &amp; table fields
          </p>
          <div className="mt-1.5 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
            {optional.map((col) => (
              <code
                key={col}
                className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {col}
              </code>
            ))}
          </div>
        </div>
      )}
      {config.rotation && (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">
          Rotation is enabled — each row may produce multiple PDFs (one per applicant).
        </p>
      )}
    </div>
  );
}

export function NoticeExcelPage() {
  const { clientId, isAdmin } = useNoticeClientContext();

  const { data: templatesData, isLoading: templatesLoading } =
    useListNoticeTemplatesQuery(
      { clientId, page: 1, limit: 100 },
      { skip: !clientId },
    );

  const templates = useMemo(
    () =>
      (templatesData?.data ?? []).filter((t) =>
        t.versions.some((v) => v.fileNames.some((f) => f.toLowerCase().endsWith('.typ'))),
      ),
    [templatesData?.data],
  );

  const [file, setFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [sheetIndex, setSheetIndex] = useState(0);
  const [stage, setStage] = useState<PageStage>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    fileName: string;
    blobUrl: string;
    rowCount: number;
    pdfCount: number;
  } | null>(null);

  const blobUrlRef = useRef<string | null>(null);

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);
  const sortedVersions = selectedTemplate
    ? [...selectedTemplate.versions].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }),
      )
    : [];

  const { data: linkedConfigRecord } = useGetNoticeConfigQuery(
    selectedTemplate?.linkedConfigId ?? '',
    { skip: !selectedTemplate?.linkedConfigId },
  );

  const effectiveConfig =
    linkedConfigRecord?.config ??
    getVersionConfig(selectedTemplate, selectedVersion);

  const { data: validation } = useGetNoticeVersionValidationQuery(
    { templateId: selectedTemplateId, version: selectedVersion },
    { skip: !selectedTemplateId || !selectedVersion },
  );

  const isGenerating = stage === 'generating';
  const canGenerate =
    !!file &&
    !!selectedTemplateId &&
    !!selectedVersion &&
    !!effectiveConfig?.id_field &&
    !isGenerating;

  const templateListUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  const configPageUrl =
    selectedTemplate?.linkedConfigId && isAdmin && clientId
      ? `/notice-generator/config?clientId=${clientId}&configId=${selectedTemplate.linkedConfigId}`
      : selectedTemplate?.linkedConfigId
        ? `/notice-generator/config?configId=${selectedTemplate.linkedConfigId}`
        : isAdmin && clientId
          ? `/notice-generator/config?clientId=${clientId}`
          : '/notice-generator/config';

  useEffect(() => {
    if (selectedTemplateId || templatesLoading || templates.length === 0) return;
    const preferred =
      templates.find((t) => t.activeVersion) ?? templates[0];
    if (!preferred) return;
    setSelectedTemplateId(preferred._id);
    setSelectedVersion(
      getActiveVersion(preferred) ??
        preferred.versions[preferred.versions.length - 1]?.version ??
        '',
    );
  }, [templates, templatesLoading, selectedTemplateId]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function handleTemplateChange(templateId: string) {
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplateId(templateId);
    setSelectedVersion(
      template
        ? (getActiveVersion(template) ??
            template.versions[template.versions.length - 1]?.version ??
            '')
        : '',
    );
    setErrorMessage(null);
  }

  function handleReset() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setFile(null);
    setSheetIndex(0);
    setStage('form');
    setErrorMessage(null);
    setResult(null);
  }

  async function handleGenerate() {
    if (!canGenerate || !file) return;
    setStage('generating');
    setErrorMessage(null);
    try {
      const batch = await fetchNoticeBatchPdf(
        selectedTemplateId,
        selectedVersion,
        file,
        sheetIndex,
      );
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(batch.blob);
      blobUrlRef.current = url;
      setResult({
        fileName: batch.fileName,
        blobUrl: url,
        rowCount: batch.rowCount,
        pdfCount: batch.pdfCount,
      });
      setStage('done');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Batch generation failed'));
      setStage('error');
    }
  }

  if (!clientId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Select a client to get started</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Choose a client from the top bar to load their templates and generate PDFs.
        </p>
      </div>
    );
  }

  if (stage === 'done' && result) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold">Batch complete</p>
            {selectedTemplate && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedTemplate.noticeName} · {selectedVersion}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} processed →{' '}
              {result.pdfCount} PDF{result.pdfCount !== 1 ? 's' : ''} in ZIP
            </p>
          </div>
          <a href={result.blobUrl} download={result.fileName} className="w-full">
            <Button className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download {result.fileName}
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Generate another batch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Excel batch generation</h2>
        <p className="text-sm text-muted-foreground">
          Upload a spreadsheet — each data row compiles into one or more PDFs using the
          selected template version and linked config mapping.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium">1. Template &amp; version</p>

        {templatesLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading templates…
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No templates with .typ files found.{' '}
              <Link to={templateListUrl} className="text-primary hover:underline">
                Create one first →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select
                value={selectedTemplateId || '__none__'}
                onValueChange={(id) => {
                  if (id !== '__none__') handleTemplateChange(id);
                }}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template…" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      <span className="truncate">{t.noticeName}</span>
                      {!t.activeVersion && (
                        <span className="ml-2 text-[10px] text-amber-600">
                          (no active)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Version</Label>
              <Select
                value={selectedVersion || '__none__'}
                onValueChange={(v) => {
                  if (v !== '__none__') setSelectedVersion(v);
                }}
                disabled={isGenerating || !selectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version…" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((v) => (
                    <SelectItem key={v.version} value={v.version}>
                      <span className="font-mono">{v.version}</span>
                      <span className="ml-2 inline-flex">
                        <NoticeVersionStatusBadge
                          status={v.status}
                          showDefault={selectedTemplate?.activeVersion === v.version}
                        />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedTemplate && !selectedTemplate.linkedConfigId && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-100">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              No config linked — using the version&apos;s embedded config.{' '}
              <Link to={configPageUrl} className="font-medium underline underline-offset-2">
                Link a config
              </Link>{' '}
              for consistent Excel column mapping.
            </p>
          </div>
        )}

        {selectedTemplate?.linkedConfigId && linkedConfigRecord && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Config:{' '}
              <span className="font-medium text-foreground">{linkedConfigRecord.name}</span>
            </span>
            <Link
              to={configPageUrl}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {effectiveConfig && <ColumnRequirements config={effectiveConfig} />}

        {validation && !validation.isValid && (
          <NoticeVariableValidationPanel validation={validation} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">2. Upload spreadsheet</p>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isGenerating}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <ExcelDropZone file={file} onFile={setFile} disabled={isGenerating} />

        <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
          <div className="space-y-1.5">
            <Label htmlFor="sheet-index" className="text-xs text-muted-foreground">
              Sheet index
            </Label>
            <Input
              id="sheet-index"
              type="number"
              min={0}
              step={1}
              value={sheetIndex}
              disabled={isGenerating}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                setSheetIndex(Number.isNaN(next) || next < 0 ? 0 : next);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            0 = first sheet. Generation stops on the first row that fails (missing{' '}
            <span className="font-mono">{effectiveConfig?.id_field ?? 'id_field'}</span>{' '}
            or compile error).
          </p>
        </div>
      </div>

      {stage === 'error' && errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Generation failed</p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs opacity-90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStage('form');
              setErrorMessage(null);
            }}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        className="w-full gap-2"
        disabled={!canGenerate}
        onClick={() => void handleGenerate()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating PDFs…
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4" />
            Generate ZIP
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-center text-xs text-muted-foreground">
          Compiling one row at a time. Large files may take several minutes — keep this tab
          open.
        </p>
      )}
    </div>
  );
}
