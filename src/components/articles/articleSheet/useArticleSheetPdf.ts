import { useState } from 'react';
import { downloadPdfFile } from '@/lib/pdfFiles';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';

interface UseArticleSheetPdfOptions {
  listId: string;
  articleNumber: string;
  clientId: string;
}

export function useArticleSheetPdf({
  listId,
  articleNumber,
  clientId,
}: UseArticleSheetPdfOptions) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await downloadPdfFile(listId, articleNumber, clientId);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download PDF'));
    } finally {
      setPdfBusy(false);
    }
  }

  return {
    pdfBusy,
    pdfViewerOpen,
    setPdfViewerOpen,
    handleDownloadPdf,
  };
}
