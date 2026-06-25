import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExportListsDialogFilterFields } from '@/components/lists/ExportListsDialogFilterFields';
import { ExportListsDialogFormFooter } from '@/components/lists/ExportListsDialogFormFooter';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import type { ExportListsDialogFormProps } from '@/components/lists/exportListsDialog.types';
import { useExportListsDialogForm } from '@/components/lists/useExportListsDialogForm';

export function ExportListsDialogForm(props: ExportListsDialogFormProps) {
  const {
    onClose,
    isAdmin,
    clients,
    noticeTypeOptions,
    yearOptions,
  } = props;

  const {
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
  } = useExportListsDialogForm(props);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-1.5">
          Export articles
          <HelpTooltip content="Export articles across multiple lists as Excel or a ZIP of tracking PDFs. Per-list export is available from each row's actions menu." />
        </DialogTitle>
      </DialogHeader>

      <ExportListsDialogFilterFields
        isAdmin={isAdmin}
        clients={clients}
        clientId={clientId}
        onClientIdChange={setClientId}
        year={year}
        onYearChange={setYear}
        month={month}
        onMonthChange={setMonth}
        yearOptions={yearOptions}
        noticeTypeOptions={noticeTypeOptions}
        noticeType={noticeType}
        onNoticeTypeChange={setNoticeType}
        dispatchFrom={dispatchFrom}
        onDispatchFromChange={setDispatchFrom}
        dispatchTo={dispatchTo}
        onDispatchToChange={setDispatchTo}
      />

      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <ExportListsDialogFormFooter
        onClose={onClose}
        busy={busy}
        startingPdfZip={startingPdfZip}
        exporting={exporting}
        onDownloadPdfs={handleDownloadPdfs}
        onExport={handleExport}
      />
    </>
  );
}
