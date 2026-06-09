import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  error?: string;
  required?: boolean;
}

export function NoticeTypeCombobox({
  value,
  onChange,
  knownTypes = [],
  error,
  required = true,
}: NoticeTypeComboboxProps) {
  const options = useMemo(() => mergeNoticeTypes(knownTypes), [knownTypes]);
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
      <Label>
        Notice Type {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={selectValue}
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

      <p className="text-xs text-muted-foreground">
        Pick a preset or add a custom type — new types appear in the filter
        after save.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
