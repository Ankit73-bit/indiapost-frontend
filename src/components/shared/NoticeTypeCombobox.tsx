import { useEffect, useMemo, useState } from 'react';
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
import { mergeNoticeTypes } from '@/lib/listNaming';

const CUSTOM_OPTION = '__custom_notice_type__';

interface NoticeTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  knownTypes?: string[];
  /** When true, only shows types used by the selected client (no global presets). */
  clientScoped?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function NoticeTypeCombobox({
  value,
  onChange,
  knownTypes = [],
  clientScoped = false,
  error,
  required = true,
  disabled = false,
}: NoticeTypeComboboxProps) {
  const options = useMemo(() => {
    if (clientScoped) {
      return [...new Set(knownTypes.map((t) => t.trim().toUpperCase()).filter(Boolean))].sort();
    }
    return mergeNoticeTypes(knownTypes);
  }, [knownTypes, clientScoped]);
  const normalizedValue = value.trim().toUpperCase();
  const valueInOptions = normalizedValue
    ? options.includes(normalizedValue)
    : false;
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (!normalizedValue) {
      setCustomMode(false);
      return;
    }
    setCustomMode(!valueInOptions);
  }, [normalizedValue, valueInOptions]);

  const selectValue = customMode
    ? CUSTOM_OPTION
    : value && valueInOptions
      ? value.toUpperCase()
      : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label>
          Notice Type {required && <span className="text-destructive">*</span>}
        </Label>
        <HelpTooltip
          content={
            clientScoped
              ? options.length > 0
                ? 'Types previously used for this client, or add a new custom type.'
                : 'No notice types yet for this client — add a custom type below.'
              : 'Pick a preset or add a custom type — new types appear in filters after save.'
          }
        />
      </div>
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={(v) => {
          if (v === CUSTOM_OPTION) {
            setCustomMode(true);
            if (valueInOptions) onChange('');
            return;
          }
          setCustomMode(false);
          onChange(v);
        }}
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
          <SelectItem value={CUSTOM_OPTION}>+ Add custom type…</SelectItem>
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
