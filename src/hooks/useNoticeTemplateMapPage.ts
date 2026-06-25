import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createEmptyEntry,
  entriesFromMap,
  mapFromEntries,
  type TemplateMapEntry,
} from '@/lib/templateMap';
import { pickDefaultVersion } from '@/pages/notice/noticeTemplateMapPage.utils';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import {
  downloadNoticeVersionTemplateMap,
  useGetNoticeTemplateQuery,
  useGetNoticeVersionTemplateMapQuery,
  useImportNoticeVersionTemplateMapMutation,
  useUpdateNoticeVersionTemplateMapMutation,
} from '@/store/api/noticeTemplatesApi';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';

export function useNoticeTemplateMapPage(templateId: string) {
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

  function updateEntry(
    id: string,
    patch: Partial<Pick<TemplateMapEntry, 'key' | 'value'>>,
  ) {
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

  const readOnly = mapData?.readOnly ?? false;
  const typFiles = mapData?.typFiles ?? [];
  const isBusy = saving || importing || mapFetching;

  return {
    template,
    templateLoading,
    selectedVersion,
    mapLoading,
    entries,
    dirty,
    listUrl,
    editorUrl,
    sortedVersions,
    readOnly,
    typFiles,
    isBusy,
    saving,
    importing,
    importRef,
    navigate,
    setVersion,
    updateEntry,
    removeEntry,
    addEntry,
    handleSave,
    handleImport,
    handleExport,
  };
}
