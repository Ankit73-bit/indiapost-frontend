import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import {
  fetchRequiredExcelColumns,
  fetchSampleExcelPreview,
  fetchTestPdfFromSampleExcel,
  uploadSampleExcelFile,
  validateSampleExcelFile,
} from '@/store/api/noticeSampleExcelApi';
import { getNoticeTemplatesListUrl } from '@/pages/notice/noticePage.utils';
import { mergeVisibleColumns } from '@/lib/sampleExcel/previewColumns';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import type { SampleExcelPreviewData, SampleExcelValidationResult } from '@/types';

export type SampleExcelPageMode = 'upload' | 'preview' | 'update';

export function useNoticeSampleExcelPage() {
  const { templateId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
  } = useGetNoticeTemplateQuery(templateId, { skip: !templateId });

  const linkedConfigId = template?.linkedConfigId;
  const {
    data: linkedConfig,
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useGetNoticeConfigQuery(linkedConfigId ?? '', { skip: !linkedConfigId });

  const [requiredColumns, setRequiredColumns] = useState<string[]>([]);
  const [indexedColumns, setIndexedColumns] = useState<string[]>([]);
  const [maxRows, setMaxRows] = useState(20);
  const [pageMode, setPageMode] = useState<SampleExcelPageMode>('upload');
  const [preview, setPreview] = useState<SampleExcelPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [excelFile, setExcelFileState] = useState<File | null>(null);
  const [validation, setValidation] = useState<SampleExcelValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [testPdfLoading, setTestPdfLoading] = useState(false);
  const [testPdfUrl, setTestPdfUrl] = useState<string | null>(null);
  const [testPdfFileName, setTestPdfFileName] = useState('test-notice.pdf');

  const listUrl = getNoticeTemplatesListUrl(isAdmin, clientId);
  const isValidated = Boolean(linkedConfig?.sampleExcelValidated);

  const selectedVersion = useMemo(() => {
    if (!template) return '';
    return (
      template.activeVersion ??
      template.versions.find((v) => v.status === 'draft')?.version ??
      template.versions[template.versions.length - 1]?.version ??
      ''
    );
  }, [template]);

  const applyPreview = useCallback(
    (nextPreview: SampleExcelPreviewData, preserveColumnSelection = true) => {
      setPreview(nextPreview);
      setVisibleColumns((previous) =>
        preserveColumnSelection
          ? mergeVisibleColumns(previous, nextPreview.columns)
          : mergeVisibleColumns([], nextPreview.columns),
      );
    },
    [],
  );

  const loadSavedPreview = useCallback(async () => {
    if (!linkedConfigId) return;
    setPreviewLoading(true);
    try {
      const nextPreview = await fetchSampleExcelPreview(linkedConfigId);
      applyPreview(nextPreview);
      setPageMode('preview');
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [applyPreview, linkedConfigId]);

  useEffect(() => {
    if (!linkedConfigId) return;
    void fetchRequiredExcelColumns(linkedConfigId)
      .then((result) => {
        setRequiredColumns(result.columns);
        setIndexedColumns(result.indexedColumns);
        setMaxRows(result.maxRows);
      })
      .catch(() => {
        setRequiredColumns([]);
        setIndexedColumns([]);
        setMaxRows(20);
      });
  }, [linkedConfigId, linkedConfig?.updatedAt]);

  useEffect(() => {
    if (!linkedConfigId || !isValidated) {
      if (!pendingSave) {
        setPageMode('upload');
      }
      return;
    }
    void loadSavedPreview();
  }, [linkedConfigId, isValidated, linkedConfig?.updatedAt, loadSavedPreview, pendingSave]);

  useEffect(() => {
    return () => {
      if (testPdfUrl) URL.revokeObjectURL(testPdfUrl);
    };
  }, [testPdfUrl]);

  function setExcelFile(file: File | null) {
    setExcelFileState(file);
    setValidation(null);
  }

  function startUpdate() {
    setPageMode('update');
    setExcelFile(null);
    setValidation(null);
    setPendingSave(false);
  }

  function cancelUpdate() {
    setPageMode('preview');
    setExcelFile(null);
    setValidation(null);
  }

  async function handleValidate() {
    if (!linkedConfigId || !excelFile) return;
    setValidating(true);
    setValidation(null);
    try {
      const result = await validateSampleExcelFile(linkedConfigId, excelFile);
      setValidation(result);
      if (result.isValid) {
        if (pageMode === 'upload') {
          if (result.preview) applyPreview(result.preview, false);
          setPendingSave(true);
          setPageMode('preview');
          toast.success('Sample Excel is valid — review the preview and save');
        } else {
          toast.success('New file passed validation — click Update Sample Excel to replace');
        }
      } else {
        toast.error('Sample Excel validation failed');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Validation failed'));
    } finally {
      setValidating(false);
    }
  }

  async function handleSaveSample() {
    if (!linkedConfigId || !excelFile) return;
    setSaving(true);
    try {
      const result = await uploadSampleExcelFile(linkedConfigId, excelFile);
      setValidation(result.validation);
      if (result.validation.preview) {
        applyPreview(result.validation.preview);
      } else {
        await loadSavedPreview();
      }
      setPendingSave(false);
      setExcelFile(null);
      setPageMode('preview');
      await refetchConfig();
      toast.success('Sample Excel saved');
    } catch (err) {
      const validationData = (err as { data?: SampleExcelValidationResult }).data;
      if (validationData) setValidation(validationData);
      toast.error(getApiErrorMessage(err, 'Failed to save sample Excel'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSample() {
    if (!linkedConfigId || !excelFile || !validation?.isValid) return;
    setSaving(true);
    try {
      const result = await uploadSampleExcelFile(linkedConfigId, excelFile);
      setValidation(null);
      if (result.validation.preview) {
        applyPreview(result.validation.preview);
      } else {
        await loadSavedPreview();
      }
      setExcelFile(null);
      setPageMode('preview');
      await refetchConfig();
      toast.success('Sample Excel updated');
    } catch (err) {
      const validationData = (err as { data?: SampleExcelValidationResult }).data;
      if (validationData) setValidation(validationData);
      toast.error(getApiErrorMessage(err, 'Failed to update sample Excel'));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestPdf() {
    if (!templateId || !selectedVersion || !isValidated) return;
    setTestPdfLoading(true);
    try {
      const result = await fetchTestPdfFromSampleExcel(templateId, selectedVersion);
      if (testPdfUrl) URL.revokeObjectURL(testPdfUrl);
      const url = URL.createObjectURL(result.blob);
      setTestPdfUrl(url);
      setTestPdfFileName(result.fileName);
      if (result.rowCount > 0) {
        toast.success(
          `Test PDF generated (${result.rowCount} row${result.rowCount !== 1 ? 's' : ''}, ${result.pdfCount} page${result.pdfCount !== 1 ? 's' : ''})`,
        );
      } else {
        toast.success('Test PDF generated');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Test PDF generation failed'));
    } finally {
      setTestPdfLoading(false);
    }
  }

  const showUploadSection = pageMode === 'upload';
  const showPreviewSection = pageMode === 'preview' || pageMode === 'update';
  const showUpdateSection = pageMode === 'update';
  const canValidate = Boolean(excelFile);
  const canSave = Boolean(pendingSave && validation?.isValid && excelFile);
  const canUpdate = Boolean(showUpdateSection && validation?.isValid && excelFile);
  const canTestPdf = isValidated && !pendingSave && pageMode !== 'update';

  return {
    template,
    templateLoading,
    templateError,
    linkedConfig,
    configLoading,
    listUrl,
    isValidated,
    pageMode,
    preview,
    previewLoading,
    visibleColumns,
    setVisibleColumns,
    requiredColumns,
    indexedColumns,
    maxRows,
    excelFile,
    setExcelFile,
    validation,
    validating,
    saving,
    pendingSave,
    showUploadSection,
    showPreviewSection,
    showUpdateSection,
    canValidate,
    canSave,
    canUpdate,
    canTestPdf,
    testPdfLoading,
    testPdfUrl,
    testPdfFileName,
    selectedVersion,
    startUpdate,
    cancelUpdate,
    handleValidate,
    handleSaveSample,
    handleUpdateSample,
    handleTestPdf,
  };
}
