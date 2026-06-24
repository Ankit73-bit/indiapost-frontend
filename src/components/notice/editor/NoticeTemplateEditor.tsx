import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';
import { CodeEditorPane } from './CodeEditorPane';
import {
  FilesSidebar,
  flattenTypFiles,
  getDefaultFilePath,
} from './FilesSidebar';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { VersionsSidebar } from './VersionsSidebar';
import {
  base64ToBlob,
  DEFAULT_CONFIG_FILE_NAME,
  storageFileName,
} from './editorUtils';
import {
  fetchNoticeTemplatePreviewPdf,
  fetchNoticeVersionFile,
  useActivateNoticeVersionMutation,
  useCreateNoticeVersionMutation,
  useDeactivateNoticeVersionMutation,
  useUpdateNoticeVersionFileMutation,
  useUploadNoticeVersionFilesMutation,
} from '@/store/api/noticeTemplatesApi';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';

interface NoticeTemplateEditorProps {
  template: NoticeTemplate;
  listUrl: string;
  onTemplateUpdated?: (template: NoticeTemplate) => void;
}

function pickVersion(
  template: NoticeTemplate,
  versionParam: string | null,
): NoticeTemplateVersion {
  if (versionParam) {
    const found = template.versions.find((v) => v.version === versionParam);
    if (found) return found;
  }
  const draft = template.versions.find((v) => v.status === 'draft');
  if (draft) return draft;
  const active = template.versions.find((v) => v.version === template.activeVersion);
  if (active) return active;
  return template.versions[0]!;
}

function isVersionReadOnly(version: NoticeTemplateVersion): boolean {
  return version.status === 'active';
}

export function NoticeTemplateEditor({
  template: initialTemplate,
  listUrl,
  onTemplateUpdated,
}: NoticeTemplateEditorProps) {
  const { isAdmin, clientId } = useNoticeClientContext();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(initialTemplate);
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['assets']),
  );
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [savedContents, setSavedContents] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const selectedVersion = pickVersion(template, searchParams.get('version'));
  const defaultFile = getDefaultFilePath(selectedVersion);
  const activeFile = searchParams.get('file') ?? defaultFile;

  const [openFiles, setOpenFiles] = useState<string[]>(() =>
    flattenTypFiles(selectedVersion).slice(0, 2),
  );

  const { data: linkedConfig } = useGetNoticeConfigQuery(
    template.linkedConfigId ?? '',
    { skip: !template.linkedConfigId },
  );

  const configPageUrl =
    isAdmin && clientId
      ? `/notice-generator/config?clientId=${clientId}&configId=${template.linkedConfigId ?? ''}`
      : `/notice-generator/config?configId=${template.linkedConfigId ?? ''}`;

  const mappingPageUrl =
    isAdmin && clientId
      ? `/notice-generator/templates/${template._id}/mapping?clientId=${clientId}&version=${selectedVersion.version}`
      : `/notice-generator/templates/${template._id}/mapping?version=${selectedVersion.version}`;

  const linkedConfigFile =
    linkedConfig?.configFileName ??
    selectedVersion.metadata.configFileName ??
    DEFAULT_CONFIG_FILE_NAME;

  const [createVersion, { isLoading: creatingVersion }] =
    useCreateNoticeVersionMutation();
  const [activateVersion, { isLoading: activating }] =
    useActivateNoticeVersionMutation();
  const [deactivateVersion, { isLoading: deactivating }] =
    useDeactivateNoticeVersionMutation();
  const [saveFile, { isLoading: savingFile }] = useUpdateNoticeVersionFileMutation();
  const [uploadFiles, { isLoading: uploading }] = useUploadNoticeVersionFilesMutation();

  const isReadOnly = isVersionReadOnly(selectedVersion);
  const isImageFile = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(activeFile);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  const updateTemplate = useCallback(
    (next: NoticeTemplate) => {
      setTemplate(next);
      onTemplateUpdated?.(next);
    },
    [onTemplateUpdated],
  );

  const typFiles = useMemo(
    () => flattenTypFiles(selectedVersion),
    [selectedVersion.fileNames],
  );

  const dirtyFiles = useMemo(() => {
    const dirty = new Set<string>();
    for (const path of typFiles) {
      if (
        fileContents[path] !== undefined &&
        fileContents[path] !== savedContents[path]
      ) {
        dirty.add(path);
      }
    }
    return dirty;
  }, [typFiles, fileContents, savedContents]);

  const loadVersionFiles = useCallback(async () => {
    setLoadingFiles(true);
    const nextContents: Record<string, string> = {};
    const nextSaved: Record<string, string> = {};
    const nextImages: Record<string, string> = {};

    try {
      for (const editorPath of typFiles) {
        const storageName = storageFileName(editorPath);
        if (!selectedVersion.fileNames.includes(storageName)) {
          nextContents[editorPath] = '';
          nextSaved[editorPath] = '';
          continue;
        }
        const file = await fetchNoticeVersionFile(
          template._id,
          selectedVersion.version,
          storageName,
        );
        nextContents[editorPath] = file.content;
        nextSaved[editorPath] = file.content;
      }

      for (const editorPath of selectedVersion.fileNames
        .filter((f) => !f.endsWith('.typ') && !f.endsWith('.json'))
        .map((f) => `assets/${f}`)) {
        const storageName = storageFileName(editorPath);
        try {
          const file = await fetchNoticeVersionFile(
            template._id,
            selectedVersion.version,
            storageName,
          );
          const blob = base64ToBlob(file.content, file.contentType);
          nextImages[editorPath] = URL.createObjectURL(blob);
        } catch {
          // image may not exist yet
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load template files'));
    } finally {
      setFileContents(nextContents);
      setSavedContents(nextSaved);
      setImageUrls((prev) => {
        for (const url of Object.values(prev)) URL.revokeObjectURL(url);
        return nextImages;
      });
      setLoadingFiles(false);
    }
  }, [template._id, selectedVersion.version, selectedVersion.fileNames, typFiles]);

  useEffect(() => {
    void loadVersionFiles();
  }, [loadVersionFiles]);

  useEffect(() => {
    setOpenFiles((prev) => {
      const kept = prev.filter((f) => typFiles.includes(f));
      if (kept.length) return kept;
      return typFiles.slice(0, 2);
    });
  }, [selectedVersion.version, typFiles]);

  useEffect(() => {
    setPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewError(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, [selectedVersion.version]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const buildTypOverrides = useCallback(() => {
    const overrides: Record<string, string> = {};
    for (const path of typFiles) {
      const content = fileContents[path];
      if (content !== undefined) {
        overrides[storageFileName(path)] = content;
      }
    }
    return overrides;
  }, [typFiles, fileContents]);

  const runPreview = useCallback(async () => {
    if (!activeFile.endsWith('.typ')) return;
    setIsRenderingPreview(true);
    setPreviewError(null);
    try {
      const result = await fetchNoticeTemplatePreviewPdf(
        template._id,
        selectedVersion.version,
        {
          fileName: storageFileName(activeFile),
          typOverrides: buildTypOverrides(),
        },
      );
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(result.blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err) {
      setPreviewError(getApiErrorMessage(err, 'Preview failed'));
      setPreviewUrl(null);
    } finally {
      setIsRenderingPreview(false);
    }
  }, [
    template._id,
    selectedVersion.version,
    activeFile,
    buildTypOverrides,
  ]);

  useEffect(() => {
    if (!previewOpen || !activeFile.endsWith('.typ')) return;
    void runPreview();
  }, [previewOpen, activeFile, selectedVersion.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePreview = useCallback(() => {
    if (previewOpen) {
      setPreviewOpen(false);
      return;
    }
    setPreviewOpen(true);
  }, [previewOpen]);

  const editorTabs = useMemo(
    () =>
      openFiles.map((path) => ({
        path,
        label: path.split('/').pop() ?? path,
        dirty: dirtyFiles.has(path),
      })),
    [openFiles, dirtyFiles],
  );

  const currentContent = fileContents[activeFile] ?? '';

  const setVersion = useCallback(
    (version: string) => {
      const next = new URLSearchParams(searchParams);
      next.set('version', version);
      next.delete('file');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setActiveFile = useCallback(
    (file: string) => {
      const next = new URLSearchParams(searchParams);
      next.set('file', file);
      setSearchParams(next, { replace: true });
      if (file.endsWith('.typ') && !openFiles.includes(file)) {
        setOpenFiles((prev) => [...prev, file]);
      }
    },
    [openFiles, searchParams, setSearchParams],
  );

  async function handleSaveFile() {
    if (isReadOnly || !activeFile.endsWith('.typ')) return;
    const storageName = storageFileName(activeFile);
    const content = fileContents[activeFile] ?? '';
    try {
      const updated = await saveFile({
        templateId: template._id,
        version: selectedVersion.version,
        fileName: storageName,
        content,
      }).unwrap();
      updateTemplate(updated);
      setSavedContents((prev) => ({ ...prev, [activeFile]: content }));
      toast.success(`Saved ${storageName}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'));
    }
  }

  async function handleUpload(fileList: FileList) {
    if (isReadOnly) return;
    const files = Array.from(fileList);
    if (!files.length) return;
    try {
      const updated = await uploadFiles({
        templateId: template._id,
        version: selectedVersion.version,
        files,
      }).unwrap();
      updateTemplate(updated);
      toast.success('Files uploaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    }
  }

  async function handleActivateVersion(version: string) {
    try {
      const updated = await activateVersion({
        templateId: template._id,
        version,
      }).unwrap();
      updateTemplate(updated);
      toast.success(`${version} is now active`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to activate version'));
    }
  }

  async function handleDeactivateVersion(version: string) {
    try {
      const updated = await deactivateVersion({
        templateId: template._id,
        version,
      }).unwrap();
      updateTemplate(updated);
      toast.success(`${version} is now inactive`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to deactivate version'));
    }
  }

  async function handleAddVersion() {
    try {
      const updated = await createVersion({
        templateId: template._id,
        cloneFromVersion: selectedVersion.version,
        description: `Duplicated from ${selectedVersion.version}`,
      }).unwrap();
      updateTemplate(updated);
      const latest = updated.versions[updated.versions.length - 1];
      if (latest) setVersion(latest.version);
      toast.success('New draft version created');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create version'));
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 shrink-0">
            <Link to={listUrl}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Templates
            </Link>
          </Button>

          <div className="h-5 w-px bg-border" />

          <p className="truncate text-sm font-semibold">
            {template.noticeName}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to={mappingPageUrl}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            <Map className="h-3 w-3" />
            Template mapping
          </Link>
          {template.linkedConfigId && linkedConfig ? (
            <Link
              to={configPageUrl}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <span className="hidden sm:inline">Config:</span>
              <span className="font-mono text-foreground">{linkedConfigFile}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              to={
                isAdmin && clientId
                  ? `/notice-generator/config?clientId=${clientId}`
                  : '/notice-generator/config'
              }
              className="rounded-md border border-dashed border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Link config →
            </Link>
          )}
        </div>
      </header>

      {isReadOnly && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          This version is active and read-only — duplicate it to create a new draft.
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <VersionsSidebar
          versions={template.versions}
          activeVersion={selectedVersion.version}
          activeVersionId={template.activeVersion}
          onSelectVersion={setVersion}
          onAddVersion={() => void handleAddVersion()}
          isAddingVersion={creatingVersion}
          onActivate={(v) => void handleActivateVersion(v)}
          onDeactivate={(v) => void handleDeactivateVersion(v)}
          isActivating={activating}
          isDeactivating={deactivating}
        />

        <FilesSidebar
          template={template}
          version={selectedVersion}
          activeFile={activeFile}
          expandedFolders={expandedFolders}
          onSelectFile={setActiveFile}
          onToggleFolder={(path) => {
            setExpandedFolders((prev) => {
              const next = new Set(prev);
              if (next.has(path)) next.delete(path);
              else next.add(path);
              return next;
            });
          }}
          onUploadFiles={(files) => void handleUpload(files)}
          isUploading={uploading}
          readOnly={isReadOnly}
        />

        {loadingFiles ? (
          <div className="flex min-w-0 flex-1 items-center justify-center bg-muted/20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isImageFile ? (
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-muted/20 p-8">
            {imageUrls[activeFile] ? (
              <img
                src={imageUrls[activeFile]}
                alt={activeFile}
                className="max-h-full max-w-full rounded-lg border border-border object-contain shadow-sm"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center">
                <p className="text-sm text-muted-foreground">{activeFile}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Upload an image using the + button in the files panel.
                </p>
              </div>
            )}
          </div>
        ) : (
          <CodeEditorPane
            projectName={template.noticeName}
            tabs={editorTabs}
            activeTab={activeFile}
            content={currentContent}
            readOnly={isReadOnly}
            isSaving={savingFile}
            previewOpen={previewOpen}
            linkedConfigFile={linkedConfig ? linkedConfigFile : undefined}
            onOpenConfig={() => navigate(configPageUrl)}
            onTabSelect={setActiveFile}
            onTabClose={(path) => {
              setOpenFiles((prev) => {
                const next = prev.filter((f) => f !== path);
                if (activeFile === path && next[0]) setActiveFile(next[0]);
                return next.length ? next : prev;
              });
            }}
            onContentChange={(value) => {
              setFileContents((prev) => ({ ...prev, [activeFile]: value }));
            }}
            onSave={() => void handleSaveFile()}
            onTogglePreview={handleTogglePreview}
          />
        )}

        {previewOpen && !isImageFile && !loadingFiles && activeFile.endsWith('.typ') && (
          <TemplatePreviewPanel
            fileName={activeFile}
            pdfUrl={previewUrl}
            loading={isRenderingPreview}
            error={previewError}
            onClose={() => setPreviewOpen(false)}
            onRefresh={() => void runPreview()}
          />
        )}
      </div>
    </div>
  );
}
