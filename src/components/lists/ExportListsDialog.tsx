import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadBulkExport, type BulkExportFilters } from '@/lib/exportList';
import { useZipDownload } from '@/components/lists/ZipDownloadProvider';
import { SearchableClientSelect } from '@/components/shared/SearchableClientSelect';
import {
  SearchableNoticeTypeSelect,
  ALL_NOTICE_TYPES,
} from '@/components/shared/SearchableNoticeTypeSelect';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import type { Client } from '@/types';

const ALL_MONTHS = '__all_months__';
const ALL_YEARS = '__all_years__';

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export interface CurrentListFilters {
  clientId?: string;
  year?: number;
  month?: number;
  noticeType?: string;
}

interface ExportListsDialogProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  clients: Client[];
  defaultClientId?: string;
  noticeTypeOptions: string[];
  yearOptions: number[];
  currentFilters: CurrentListFilters;
  onSuccess?: () => void;
}

type ExportListsDialogFormProps = Omit<ExportListsDialogProps, 'open'>;

function ExportListsDialogForm({
  onClose,
  isAdmin,
  clients,
  defaultClientId,
  noticeTypeOptions,
  yearOptions,
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

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-1.5">
          Export articles
          <HelpTooltip content="Export articles across multiple lists as Excel or a ZIP of tracking PDFs. Per-list export is available from each row's actions menu." />
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {isAdmin && (
          <div className="space-y-1.5">
            <Label>Client</Label>
            <SearchableClientSelect
              clients={clients}
              value={clientId}
              onChange={(id) => setClientId(id ?? '')}
              showAllOption={false}
              className="w-full"
              placeholder="Select client"
              portaled={false}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_YEARS}>All years</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_MONTHS}>All months</SelectItem>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            Notice type
            <HelpTooltip content="Limit export to lists with this notice type." />
          </Label>
          <SearchableNoticeTypeSelect
            options={noticeTypeOptions}
            value={noticeType}
            onChange={setNoticeType}
            placeholder="All notice types"
            className="w-full"
            portaled={false}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            Dispatch date range
            <HelpTooltip content="Optional — leave blank to ignore dispatch dates." />
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dispatch-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="dispatch-from"
                type="date"
                value={dispatchFrom}
                onChange={(e) => setDispatchFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dispatch-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="dispatch-to"
                type="date"
                value={dispatchTo}
                onChange={(e) => setDispatchTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadPdfs}
          disabled={busy}
        >
          {startingPdfZip ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="mr-1.5 h-3.5 w-3.5" />
          )}
          Download PDFs
        </Button>
        <Button type="button" onClick={handleExport} disabled={busy}>
          {exporting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          Download Excel
        </Button>
      </DialogFooter>
    </>
  );
}

export function ExportListsDialog({
  open,
  onClose,
  ...formProps
}: ExportListsDialogProps) {
  const formKey = [
    formProps.currentFilters.clientId,
    formProps.currentFilters.year,
    formProps.currentFilters.month,
    formProps.currentFilters.noticeType,
    formProps.defaultClientId,
  ].join('|');

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <ExportListsDialogForm key={formKey} onClose={onClose} {...formProps} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
