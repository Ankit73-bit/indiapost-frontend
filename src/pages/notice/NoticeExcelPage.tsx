import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import { fetchBatchNoticePdf } from '@/store/api/noticeExcelApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = 'select' | 'generating' | 'done' | 'error';

// ─── Sub-components ───────────────────────────────────────────────────────────

function TemplateSelector({
  clientId,
  isAdmin,
  value,
  onChange,
}: {
  clientId: string;
  isAdmin: boolean;
  value: string;
  onChange: (templateId: string, version: string, name: string) => void;
}) {
  const { data, isLoading } = useListNoticeTemplatesQuery(
    { clientId, limit: 100 },
    { skip: !clientId },
  );

  const templates = (data?.data ?? []).filter((t) => t.activeVersion);

  if (!clientId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a client above to see available templates.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading templates…
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        <p>No templates with an active version found for this client.</p>
        <Link
          to={
            isAdmin && clientId
              ? `/notice-generator/templates?clientId=${clientId}`
              : '/notice-generator/templates'
          }
          className="text-primary hover:underline"
        >
          Go to templates →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => {
        const selected = value === t._id;
        return (
          <button
            key={t._id}
            type="button"
            onClick={() => onChange(t._id, t.activeVersion!, t.noticeName)}
            className={cn(
              'group flex flex-col gap-1 rounded-lg border p-3 text-left transition-all',
              selected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  selected ? 'text-foreground' : 'text-foreground/80',
                )}
              >
                {t.noticeName}
              </p>
              {selected && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">{t.noticeId}</p>
            <span className="mt-1 inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              {t.activeVersion} · active
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ExcelDropZone({
  file,
  onFile,
  onClear,
  disabled,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f) return;
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') return;
      onFile(f);
    },
    [onFile],
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="rounded p-1 hover:bg-muted"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' '))
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          disabled && 'pointer-events-none opacity-50',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <div className="rounded-full bg-muted p-3">
          <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drop your Excel file here or{' '}
            <span className="text-primary">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">.xlsx or .xls · max 10 MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function NoticeExcelPage() {
  const { clientId, isAdmin } = useNoticeClientContext();

  // Selection state
  const [templateId, setTemplateId] = useState('');
  const [templateVersion, setTemplateVersion] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Page state machine
  const [pageState, setPageState] = useState<PageState>('select');
  const [errorMsg, setErrorMsg] = useState('');

  // Result state
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zipFileName, setZipFileName] = useState('batch.zip');
  const [rowCount, setRowCount] = useState(0);
  const [pdfCount, setPdfCount] = useState(0);

  // Revoke blob URL on unmount or when reset
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  function handleTemplateChange(id: string, version: string, name: string) {
    setTemplateId(id);
    setTemplateVersion(version);
    setTemplateName(name);
  }

  function reset() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setErrorMsg('');
    setPageState('select');
    setExcelFile(null);
  }

  async function handleGenerate() {
    if (!templateId || !templateVersion || !excelFile) return;

    setPageState('generating');
    setErrorMsg('');

    try {
      const result = await fetchBatchNoticePdf(templateId, templateVersion, excelFile);
      const url = URL.createObjectURL(result.blob);
      setBlobUrl(url);
      setZipFileName(result.fileName);
      setRowCount(result.rowCount);
      setPdfCount(result.pdfCount);
      setPageState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Batch generation failed');
      setPageState('error');
    }
  }

  const canGenerate = Boolean(templateId && excelFile && clientId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {/* ── State: Generating ── */}
      {pageState === 'generating' && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <Loader2 className="absolute h-14 w-14 animate-spin text-primary/20" />
            <FileSpreadsheet className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Generating PDFs…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Processing <span className="font-medium">{excelFile?.name}</span> with{' '}
              <span className="font-medium">{templateName}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This may take a few minutes depending on the number of rows.
            </p>
          </div>
        </div>
      )}

      {/* ── State: Done ── */}
      {pageState === 'done' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-semibold">Batch complete</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pdfCount} PDF{pdfCount !== 1 ? 's' : ''} generated from {rowCount} row
            {rowCount !== 1 ? 's' : ''}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {blobUrl && (
              <a href={blobUrl} download={zipFileName}>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
              </a>
            )}
            <Button variant="outline" className="gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Generate another batch
            </Button>
          </div>
        </div>
      )}

      {/* ── State: Error ── */}
      {pageState === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-destructive">Generation failed</p>
              <p className="mt-1 break-words text-sm text-destructive/80">{errorMsg}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* ── State: Select ── */}
      {(pageState === 'select' || pageState === 'error') && (
        <div className="space-y-6">
          {/* Step 1 — Template */}
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">1. Select template</h2>
              <p className="text-xs text-muted-foreground">
                Only templates with an active version are shown.
              </p>
            </div>
            <TemplateSelector
              clientId={clientId}
              isAdmin={isAdmin}
              value={templateId}
              onChange={handleTemplateChange}
            />
          </section>

          <div className="border-t border-border" />

          {/* Step 2 — Excel file */}
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">2. Upload Excel file</h2>
              <p className="text-xs text-muted-foreground">
                Each row will be compiled into a separate PDF using the active template
                version.
              </p>
            </div>
            <ExcelDropZone
              file={excelFile}
              onFile={setExcelFile}
              onClear={() => setExcelFile(null)}
              disabled={!templateId}
            />
            {!templateId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Select a template above before uploading a file.
              </p>
            )}
          </section>

          <div className="border-t border-border" />

          {/* Step 3 — Generate */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">3. Generate</h2>
            {templateId && templateVersion && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Template:{' '}
                    <span className="font-medium text-foreground">{templateName}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Version:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {templateVersion}
                    </span>
                  </span>
                  {excelFile && (
                    <span className="text-muted-foreground">
                      File:{' '}
                      <span className="font-medium text-foreground">{excelFile.name}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
            <Button
              className="gap-2"
              disabled={!canGenerate}
              onClick={() => void handleGenerate()}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Generate PDFs
            </Button>
            {!clientId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Select a client to get started.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
