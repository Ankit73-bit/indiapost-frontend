import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadBulkExport, type BulkExportFilters } from '@/lib/exportList';
import type { Client } from '@/types';

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

export type ExportMode =
  | 'current'
  | 'yearly'
  | 'monthly'
  | 'noticeType'
  | 'dateRange';

export interface CurrentListFilters {
  clientId?: string;
  year?: number;
  month?: number;
  noticeType?: string;
  includeArchived?: boolean;
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

function currentYear(): number {
  return new Date().getFullYear();
}

export function ExportListsDialog({
  open,
  onClose,
  isAdmin,
  clients,
  defaultClientId,
  noticeTypeOptions,
  yearOptions,
  currentFilters,
  onSuccess,
}: ExportListsDialogProps) {
  const [mode, setMode] = useState<ExportMode>('current');
  const [clientId, setClientId] = useState(defaultClientId ?? '');
  const [year, setYear] = useState(String(currentYear()));
  const [month, setMonth] = useState('1');
  const [noticeType, setNoticeType] = useState('');
  const [dispatchFrom, setDispatchFrom] = useState('');
  const [dispatchTo, setDispatchTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setMode('current');
    setClientId(currentFilters.clientId ?? defaultClientId ?? '');
    setYear(String(currentFilters.year ?? currentYear()));
    setMonth(String(currentFilters.month ?? new Date().getMonth() + 1));
    setNoticeType(currentFilters.noticeType ?? '');
    setDispatchFrom('');
    setDispatchTo('');
  }, [open, currentFilters, defaultClientId]);

  const currentFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (currentFilters.year) parts.push(`Year ${currentFilters.year}`);
    else parts.push('All years');
    if (currentFilters.month) {
      const label = MONTH_OPTIONS.find((m) => m.value === String(currentFilters.month))?.label;
      parts.push(label ?? `Month ${currentFilters.month}`);
    }
    if (currentFilters.noticeType) parts.push(currentFilters.noticeType);
    if (currentFilters.includeArchived) parts.push('Archived only');
    else parts.push('Active lists');
    return parts.join(' · ');
  }, [currentFilters]);

  function buildFilters(): BulkExportFilters | null {
    if (!clientId) {
      setError('Select a client to export.');
      return null;
    }

    const base: BulkExportFilters = { clientId };

    switch (mode) {
      case 'current':
        return {
          ...base,
          clientId: currentFilters.clientId ?? clientId,
          year: currentFilters.year,
          month: currentFilters.month,
          noticeType: currentFilters.noticeType,
          includeArchived: currentFilters.includeArchived,
        };
      case 'yearly':
        return { ...base, year: Number(year) };
      case 'monthly':
        return { ...base, year: Number(year), month: Number(month) };
      case 'noticeType':
        if (!noticeType) {
          setError('Select a notice type.');
          return null;
        }
        return { ...base, noticeType };
      case 'dateRange':
        if (!dispatchFrom && !dispatchTo) {
          setError('Enter at least a start or end dispatch date.');
          return null;
        }
        return {
          ...base,
          dispatchFrom: dispatchFrom || undefined,
          dispatchTo: dispatchTo || undefined,
        };
      default:
        return base;
    }
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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !exporting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export articles to Excel</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Export articles across multiple lists. Per-list export is still available
          from each row&apos;s actions menu.
        </p>

        {isAdmin && (
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select
              value={clientId}
              onValueChange={setClientId}
              disabled={mode === 'current' && Boolean(currentFilters.clientId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as ExportMode)}>
          <TabsList className="w-full flex-wrap h-auto">
            <TabsTrigger value="current" className="text-xs">
              Current filters
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">
              Yearly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="noticeType" className="text-xs">
              Notice type
            </TabsTrigger>
            <TabsTrigger value="dateRange" className="text-xs">
              Date range
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-3">
            <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {currentFilterSummary}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Uses the same year, month, notice type, and visibility filters shown on
              the lists page.
            </p>
          </TabsContent>

          <TabsContent value="yearly" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
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
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="noticeType" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Notice type</Label>
              <Select value={noticeType} onValueChange={setNoticeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notice type" />
                </SelectTrigger>
                <SelectContent>
                  {noticeTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="dateRange" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Filter lists by dispatch date range.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dispatch-from">From</Label>
                <Input
                  id="dispatch-from"
                  type="date"
                  value={dispatchFrom}
                  onChange={(e) => setDispatchFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dispatch-to">To</Label>
                <Input
                  id="dispatch-to"
                  type="date"
                  value={dispatchTo}
                  onChange={(e) => setDispatchTo(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
