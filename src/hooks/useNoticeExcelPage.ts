import { useEffect, useState } from 'react';
import { fetchBatchNoticePdf } from '@/store/api/noticeExcelApi';
import type { NoticeExcelPageState } from '@/pages/notice/noticeExcelPage.types';

export function useNoticeExcelPage(clientId: string) {
  const [templateId, setTemplateId] = useState('');
  const [templateVersion, setTemplateVersion] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);

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
      const result = await fetchBatchNoticePdf(templateId, templateVersion, excelFile, {
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
      setErrorMsg(err instanceof Error ? err.message : 'Batch generation failed');
      setPageState('error');
    }
  }

  const canGenerate = Boolean(
    templateId && excelFile && clientId && (mergePdfs || includeIndividualPdfs),
  );

  return {
    templateId,
    templateVersion,
    templateName,
    excelFile,
    setExcelFile,
    pageState,
    errorMsg,
    blobUrl,
    zipFileName,
    rowCount,
    pdfCount,
    individualPdfCount,
    mergedPdfCount,
    mergePdfs,
    setMergePdfs,
    includeIndividualPdfs,
    setIncludeIndividualPdfs,
    handleTemplateChange,
    reset,
    handleGenerate,
    canGenerate,
  };
}
