import { useState } from 'react';
import { ALL_NOTICE_TYPES } from '@/components/shared/SearchableNoticeTypeSelect';
import { downloadBulkExport, type BulkExportFilters } from '@/lib/exportList';
import { useZipDownload } from '@/components/lists/useZipDownload';
import {
  ALL_MONTHS,
  ALL_YEARS,
} from '@/components/lists/exportListsDialog.constants';
import type { ExportListsDialogFormProps } from '@/components/lists/exportListsDialog.types';

export function useExportListsDialogForm({
  onClose,
  clients,
  defaultClientId,
  currentFilters,
  onSuccess,
}: ExportListsDialogFormProps) {
  const [clientId, setClientId] = useState(
    currentFilters.clientId ?? defaultClientId ?? '',
  );
  const [year, setYear] = useState(
    currentFilters.year ? String(currentFilters.year) : ALL_YEARS,
  );
  const [month, setMonth] = useState(
    currentFilters.month ? String(currentFilters.month) : ALL_MONTHS,
  );
  const [noticeType, setNoticeType] = useState(
    currentFilters.noticeType ?? ALL_NOTICE_TYPES,
  );
  const [dispatchFrom, setDispatchFrom] = useState('');
  const [dispatchTo, setDispatchTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [startingPdfZip, setStartingPdfZip] = useState(false);
  const [error, setError] = useState('');
  const { startBulkZipDownload } = useZipDownload();

  function buildFilters(): BulkExportFilters | null {
    if (!clientId) {
      setError('Select a client to export.');
      return null;
    }

    return {
      clientId,
      year: year === ALL_YEARS ? undefined : Number(year),
      month: month === ALL_MONTHS ? undefined : Number(month),
      noticeType:
        noticeType === ALL_NOTICE_TYPES ? undefined : noticeType,
      dispatchFrom: dispatchFrom || undefined,
      dispatchTo: dispatchTo || undefined,
    };
  }

  async function handleExport() {
    setError('');
    const filters = buildFilters();
    if (!filters) return;

    setExporting(true);
    try {
      await downloadBulkExport(filters);
      onSuccess?.();
      onClose();
    } catch {
      setError('Export failed. Check your filters and try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadPdfs() {
    setError('');
    const filters = buildFilters();
    if (!filters) return;

    const clientName =
      clients.find((c) => c._id === filters.clientId)?.name ?? 'Export';

    setStartingPdfZip(true);
    try {
      startBulkZipDownload({
        clientId: filters.clientId,
        clientName,
        filters,
        label: 'Generating filtered PDFs…',
        onComplete: () => onSuccess?.(),
      });
      onClose();
    } catch {
      setError('Failed to start PDF download. Check your filters and try again.');
    } finally {
      setStartingPdfZip(false);
    }
  }

  const busy = exporting || startingPdfZip;

  return {
    clientId,
    setClientId,
    year,
    setYear,
    month,
    setMonth,
    noticeType,
    setNoticeType,
    dispatchFrom,
    setDispatchFrom,
    dispatchTo,
    setDispatchTo,
    exporting,
    startingPdfZip,
    error,
    busy,
    handleExport,
    handleDownloadPdfs,
  };
}
