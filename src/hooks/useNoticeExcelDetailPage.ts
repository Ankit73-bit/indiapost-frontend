import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useGetNoticeExcelQuery } from '@/store/api/noticeExcelsApi';
import {
  downloadNoticeExcelFile,
  fetchNoticeExcelPreview,
} from '@/store/api/noticeExcelsApi';
import { mergeVisibleColumns } from '@/lib/sampleExcel/previewColumns';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import type { SampleExcelPreviewData } from '@/types';

export function useNoticeExcelDetailPage() {
  const { excelId = '' } = useParams();
  const { isAdmin, clientId } = useNoticeClientContext();

  const {
    data: record,
    isLoading,
    isError,
  } = useGetNoticeExcelQuery(excelId, { skip: !excelId });

  const [preview, setPreview] = useState<SampleExcelPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/excel?clientId=${clientId}`
      : '/notice-generator/excel';

  const loadPreview = useCallback(async () => {
    if (!excelId || record?.status !== 'VALIDATED') return;
    setPreviewLoading(true);
    try {
      const nextPreview = await fetchNoticeExcelPreview(excelId);
      setPreview(nextPreview);
      setVisibleColumns((previous) =>
        mergeVisibleColumns(previous, nextPreview.columns),
      );
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [excelId, record?.status]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function handleDownload() {
    if (!excelId) return;
    setDownloading(true);
    try {
      const result = await downloadNoticeExcelFile(excelId);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Download failed'));
    } finally {
      setDownloading(false);
    }
  }

  return {
    record,
    isLoading,
    isError,
    listUrl,
    preview,
    previewLoading,
    visibleColumns,
    setVisibleColumns,
    downloading,
    handleDownload,
  };
}
