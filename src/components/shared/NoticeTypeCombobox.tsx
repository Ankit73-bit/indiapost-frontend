import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CUSTOM_NOTICE_TYPE_OPTION } from '@/components/shared/noticeTypeCombobox.constants';
import type { NoticeTypeComboboxProps } from '@/components/shared/noticeTypeCombobox.types';
import { useNoticeTypeCombobox } from '@/components/shared/useNoticeTypeCombobox';

export function NoticeTypeCombobox({
  value,
  onChange,
  knownTypes = [],
  clientScoped = false,
  error,
  required = true,
  disabled = false,
}: NoticeTypeComboboxProps) {
  const {
    options,
    customMode,
    selectValue,
    handleSelectChange,
    helpContent,
  } = useNoticeTypeCombobox({ value, onChange, knownTypes, clientScoped });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label>
          Notice Type {required && <span className="text-destructive">*</span>}
        </Label>
        <HelpTooltip content={helpContent} />
      </div>
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select notice type" />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_NOTICE_TYPE_OPTION}>+ Add custom type…</SelectItem>
        </SelectContent>
      </Select>

      {customMode && (
        <Input
          placeholder="Enter custom notice type"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          autoFocus
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
