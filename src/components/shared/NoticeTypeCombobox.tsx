import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_NOTICE_TYPES } from '@/lib/listNaming';

interface NoticeTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function NoticeTypeCombobox({
  value,
  onChange,
  error,
  required = true,
}: NoticeTypeComboboxProps) {
  const listId = useId();

  return (
    <div className="space-y-1.5">
      <Label>
        Notice Type {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        list={listId}
        placeholder="Select or type a notice type"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
      <datalist id={listId}>
        {DEFAULT_NOTICE_TYPES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">
        Pick a preset or enter a custom type (e.g. FINAL NOTICE).
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
