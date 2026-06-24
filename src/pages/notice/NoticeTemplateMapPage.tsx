import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
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
import { toast } from '@/lib/toast';
import {
  createEmptyEntry,
  entriesFromMap,
  mapFromEntries,
  type TemplateMapEntry,
} from '@/lib/templateMap';
import {
  downloadNoticeVersionTemplateMap,
  useGetNoticeTemplateQuery,
  useGetNoticeVersionTemplateMapQuery,
  useImportNoticeVersionTemplateMapMutation,
  useUpdateNoticeVersionTemplateMapMutation,
} from '@/store/api/noticeTemplatesApi';

interface NoticeTemplateMapPageProps {
  templateId: string;
}

function pickDefaultVersion(
  template: NonNullable<ReturnType<typeof useGetNoticeTemplateQuery>['data']>,
  versionParam: string | null,
): string {
  if (versionParam && template.versions.some((v) => v.version === versionParam)) {
    return versionParam;
  }
  const draft = template.versions.find((v) => v.status === 'draft');
  if (draft) return draft.version;
  if (template.activeVersion) return template.activeVersion;
  return template.versions[template.versions.length - 1]?.version ?? 'v1';
}

export function NoticeTemplateMapPage({ templateId }: NoticeTemplateMapPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, clientId } = useNoticeClientContext();
  const importRef = useRef<HTMLInputElement>(null);

  const { data: template, isLoading: templateLoading } =
    useGetNoticeTemplateQuery(templateId);

  const selectedVersion = template
    ? pickDefaultVersion(template, searchParams.get('version'))
    : '';

  const {
    data: mapData,
    isLoading: mapLoading,
    isFetching: mapFetching,
  } = useGetNoticeVersionTemplateMapQuery(
    { templateId, version: selectedVersion },
    { skip: !templateId || !selectedVersion },
  );

  const [entries, setEntries] = useState<TemplateMapEntry[]>([]);
  const [dirty, setDirty] = useState(false);

  const [saveMap, { isLoading: saving }] = useUpdateNoticeVersionTemplateMapMutation();
  const [importMap, { isLoading: importing }] = useImportNoticeVersionTemplateMapMutation();

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  const editorUrl =
    isAdmin && clientId
      ? `/notice-generator/templates/${templateId}/editor?clientId=${clientId}&version=${selectedVersion}`
      : `/notice-generator/templates/${templateId}/editor?version=${selectedVersion}`;

  const sortedVersions = useMemo(
    () =>
      template
        ? [...template.versions].sort((a, b) =>
            b.version.localeCompare(a.version, undefined, { numeric: true }),
          )
        : [],
    [template],
  );

  useEffect(() => {
    if (!mapData) return;
    setEntries(entriesFromMap(mapData.mappings));
    setDirty(false);
  }, [mapData]);

  function setVersion(version: string) {
    const next = new URLSearchParams(searchParams);
    next.set('version', version);
    setSearchParams(next, { replace: true });
  }

  function updateEntry(id: string, patch: Partial<Pick<TemplateMapEntry, 'key' | 'value'>>) {
    setEntries((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
    setDirty(true);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((row) => row.id !== id));
    setDirty(true);
  }

  function addEntry() {
    setEntries((prev) => [...prev, createEmptyEntry()]);
    setDirty(true);
  }

  async function handleSave() {
    if (!selectedVersion) return;
    try {
      await saveMap({
        templateId,
        version: selectedVersion,
        mappings: mapFromEntries(entries),
      }).unwrap();
      setDirty(false);
      toast.success('Template mapping saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save template mapping'));
    }
  }

  async function handleImport(file: File) {
    if (!selectedVersion) return;
    try {
      await importMap({ templateId, version: selectedVersion, file }).unwrap();
      setDirty(false);
      toast.success('template.json imported and saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Import failed'));
    }
  }

  async function handleExport() {
    if (!selectedVersion) return;
    try {
      const { blob, fileName } = await downloadNoticeVersionTemplateMap(
        templateId,
        selectedVersion,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('template.json downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Export failed'));
    }
  }

  if (templateLoading || !template) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const readOnly = mapData?.readOnly ?? false;
  const typFiles = mapData?.typFiles ?? [];
  const isBusy = saving || importing || mapFetching;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 h-8">
            <Link to={listUrl}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <h2 className="text-lg font-semibold">Template mapping</h2>
          <p className="text-sm text-muted-foreground">
            {template.noticeName} — maps state/language keys to .typ files for PDF
            generation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(editorUrl)}>
          Open editor
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-3 sm:max-w-xs">
          <Label className="text-xs text-muted-foreground">Version</Label>
          <Select value={selectedVersion} onValueChange={setVersion} disabled={isBusy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortedVersions.map((v) => (
                <SelectItem key={v.version} value={v.version}>
                  <span className="font-mono">{v.version}</span>
                  <span className="ml-2 inline-flex">
                    <NoticeVersionStatusBadge
                      status={v.status}
                      showDefault={template.activeVersion === v.version}
                    />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {readOnly && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-100">
            This version is active and read-only. Duplicate to a draft in the editor to
            change mappings.
          </div>
        )}

        {typFiles.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No .typ files in this version.{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => navigate(editorUrl)}
            >
              Upload templates first
            </button>
          </div>
        )}

        {mapLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading mappings…
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[1fr_1fr_40px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Key (state / language)</span>
                <span>.typ file</span>
                <span />
              </div>
              <div className="divide-y divide-border">
                {entries.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No mappings yet. Import template.json or add rows below.
                  </p>
                ) : (
                  entries.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 px-3 py-2"
                    >
                      <Input
                        value={row.key}
                        disabled={readOnly || isBusy}
                        placeholder='e.g. DEFAULT or "UTTAR PRADESH"'
                        className="font-mono text-xs"
                        onChange={(e) => updateEntry(row.id, { key: e.target.value })}
                      />
                      <Select
                        value={row.value || '__none__'}
                        onValueChange={(v) => {
                          if (v !== '__none__') updateEntry(row.id, { value: v });
                        }}
                        disabled={readOnly || isBusy || typFiles.length === 0}
                      >
                        <SelectTrigger className="font-mono text-xs">
                          <SelectValue placeholder="Select .typ" />
                        </SelectTrigger>
                        <SelectContent>
                          {typFiles.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={readOnly || isBusy}
                        onClick={() => removeEntry(row.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isBusy}
                onClick={addEntry}
              >
                <Plus className="h-3.5 w-3.5" />
                Add mapping
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />
        {!readOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              disabled={isBusy}
              onClick={() => importRef.current?.click()}
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Import template.json
            </Button>
            <Button
              type="button"
              className="gap-1.5"
              disabled={!dirty || isBusy || entries.length === 0}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save mappings
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5"
          disabled={isBusy || entries.length === 0}
          onClick={() => void handleExport()}
        >
          <Download className="h-3.5 w-3.5" />
          Export template.json
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Mappings are stored in the database per template version. Include{' '}
        <span className="font-mono">DEFAULT</span>, empty key, or{' '}
        <span className="font-mono">-</span> for the fallback .typ file. Excel rows use
        State/Language columns to pick the mapped file at generation time.
      </p>
    </div>
  );
}
