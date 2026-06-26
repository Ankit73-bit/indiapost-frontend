import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import {
  fetchRequiredExcelColumns,
  fetchTestPdfFromSampleExcel,
  uploadSampleExcelFile,
  validateSampleExcelFile,
} from '@/store/api/noticeSampleExcelApi';
import { getNoticeTemplatesListUrl } from '@/pages/notice/noticePage.utils';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import type { SampleExcelValidationResult } from '@/types';

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
  const [excelFile, setExcelFileState] = useState<File | null>(null);
  const [validation, setValidation] = useState<SampleExcelValidationResult | null>(
    null,
  );
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
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
    return () => {
      if (testPdfUrl) URL.revokeObjectURL(testPdfUrl);
    };
  }, [testPdfUrl]);

  function setExcelFile(file: File | null) {
    setExcelFileState(file);
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
        toast.success('Sample Excel headers are valid');
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

  return {
    template,
    templateLoading,
    templateError,
    linkedConfig,
    configLoading,
    listUrl,
    isValidated,
    requiredColumns,
    indexedColumns,
    maxRows,
    excelFile,
    setExcelFile,
    validation,
    validating,
    saving,
    testPdfLoading,
    testPdfUrl,
    testPdfFileName,
    selectedVersion,
    handleValidate,
    handleSaveSample,
    handleTestPdf,
  };
}
