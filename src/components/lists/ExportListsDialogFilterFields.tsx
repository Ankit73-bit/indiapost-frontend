import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableClientSelect } from '@/components/shared/SearchableClientSelect';
import { SearchableNoticeTypeSelect } from '@/components/shared/SearchableNoticeTypeSelect';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import {
  ALL_MONTHS,
  ALL_YEARS,
  MONTH_OPTIONS,
} from '@/components/lists/exportListsDialog.constants';
import type { Client } from '@/types';

interface ExportListsDialogFilterFieldsProps {
  isAdmin: boolean;
  clients: Client[];
  clientId: string;
  onClientIdChange: (clientId: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  yearOptions: number[];
  noticeTypeOptions: string[];
  noticeType: string;
  onNoticeTypeChange: (noticeType: string) => void;
  dispatchFrom: string;
  onDispatchFromChange: (value: string) => void;
  dispatchTo: string;
  onDispatchToChange: (value: string) => void;
}

export function ExportListsDialogFilterFields({
  isAdmin,
  clients,
  clientId,
  onClientIdChange,
  year,
  onYearChange,
  month,
  onMonthChange,
  yearOptions,
  noticeTypeOptions,
  noticeType,
  onNoticeTypeChange,
  dispatchFrom,
  onDispatchFromChange,
  dispatchTo,
  onDispatchToChange,
}: ExportListsDialogFilterFieldsProps) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="space-y-1.5">
          <Label>Client</Label>
          <SearchableClientSelect
            clients={clients}
            value={clientId}
            onChange={(id) => onClientIdChange(id ?? '')}
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
          <Select value={year} onValueChange={onYearChange}>
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
          <Select value={month} onValueChange={onMonthChange}>
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
          onChange={onNoticeTypeChange}
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
              onChange={(e) => onDispatchFromChange(e.target.value)}
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
              onChange={(e) => onDispatchToChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
