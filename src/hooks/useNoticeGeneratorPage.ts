import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetNoticeExcelQuery,
  fetchBatchPdfFromStoredExcel,
} from '@/store/api/noticeExcelsApi';
import { useGetNoticeTemplateQuery } from '@/store/api/noticeTemplatesApi';
import { useGetNoticeConfigQuery } from '@/store/api/noticeConfigsApi';
import { listDisplayName } from '@/lib/listNaming';
import type { NoticeExcelPageState } from '@/pages/notice/noticeExcelPage.types';

export function useNoticeGeneratorPage() {
  const [searchParams] = useSearchParams();
  const excelId = searchParams.get('excelId') ?? '';

  const {
    data: excel,
    isLoading: excelLoading,
    isError: excelError,
  } = useGetNoticeExcelQuery(excelId, { skip: !excelId });

  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
  } = useGetNoticeTemplateQuery(excel?.templateId ?? '', {
    skip: !excel?.templateId,
  });

  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useGetNoticeConfigQuery(excel?.configId ?? '', {
    skip: !excel?.configId,
  });

  const [pageState, setPageState] = useState<NoticeExcelPageState>('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zipFileName, setZipFileName] = useState('batch.zip');
  const [rowCount, setRowCount] = useState(0);
  const [pdfCount, setPdfCount] = useState(0);
  const [individualPdfCount, setIndividualPdfCount] = useState(0);
  const [mergedPdfCount, setMergedPdfCount] = useState(0);
  const [mergePdfs, setMergePdfs] = useState(true);
  const [includeIndividualPdfs, setIncludeIndividualPdfs] = useState(true);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const prerequisiteError = useMemo(() => {
    if (!excelId) return 'No Excel selected. Open Generator from a validated Excel row.';
    if (excelLoading) return null;
    if (excelError || !excel) return 'Selected Excel record could not be loaded.';
    if (excel.status !== 'VALIDATED') {
      return 'Excel must be in Validated status before generating PDFs.';
    }
    if (!excel.templateId) return 'Excel is not associated with a template.';
    if (!excel.configId) return 'Excel is not associated with a config.';
    if (templateLoading || configLoading) return null;
    if (templateError || !template) return 'Associated template no longer exists.';
    if (configError || !config) return 'Associated config no longer exists.';
    if (template.linkedConfigId !== excel.configId) {
      return 'Template and Excel config association is no longer valid.';
    }
    if (!excel.templateVersion) return 'Excel has no template version recorded.';
    const versionExists = template.versions.some(
      (v) => v.version === excel.templateVersion,
    );
    if (!versionExists) {
      return `Template version "${excel.templateVersion}" is no longer available.`;
    }
    return null;
  }, [
    excelId,
    excel,
    excelLoading,
    excelError,
    template,
    templateLoading,
    templateError,
    config,
    configLoading,
    configError,
  ]);

  const canGenerate = Boolean(
    excelId &&
      excel?.status === 'VALIDATED' &&
      !prerequisiteError &&
      (mergePdfs || includeIndividualPdfs),
  );

  function reset() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setErrorMsg('');
    setPageState('select');
  }

  async function handleGenerate() {
    if (!excelId || !canGenerate) return;

    setPageState('generating');
    setErrorMsg('');

    try {
      const result = await fetchBatchPdfFromStoredExcel(excelId, {
        mergePdfs,
        individualPdfs: includeIndividualPdfs,
      });
      const url = URL.createObjectURL(result.blob);
      setBlobUrl(url);
      setZipFileName(result.fileName);
      setRowCount(result.rowCount);
      setPdfCount(result.pdfCount);
      setIndividualPdfCount(result.individualPdfCount);
      setMergedPdfCount(result.mergedPdfCount);
      setPageState('done');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Batch generation failed',
      );
      setPageState('error');
    }
  }

  return {
    excelId,
    excel,
    excelLoading,
    excelName: excel ? listDisplayName(excel) : '',
    templateName: excel?.templateName ?? template?.noticeName ?? '—',
    configName: excel?.configName ?? config?.name ?? '—',
    templateVersion: excel?.templateVersion ?? '',
    rowCount: excel?.rowCount ?? 0,
    pageState,
    errorMsg,
    blobUrl,
    zipFileName,
    generatedRowCount: rowCount,
    pdfCount,
    individualPdfCount,
    mergedPdfCount,
    mergePdfs,
    setMergePdfs,
    includeIndividualPdfs,
    setIncludeIndividualPdfs,
    prerequisiteError,
    canGenerate,
    reset,
    handleGenerate,
  };
}
