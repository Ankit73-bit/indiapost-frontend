import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NoticeConfigTagListFieldProps } from '@/components/notice/config/noticeConfigForm.types';

export function NoticeConfigTagListField({
  label,
  required,
  hint,
  values,
  onChange,
  placeholder,
  error,
  readOnly,
}: NoticeConfigTagListFieldProps) {
  const [draft, setDraft] = useState('');

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        <Badge variant={required ? 'default' : 'secondary'} className="text-[10px]">
          {required ? 'Required' : 'Optional'}
        </Badge>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder ?? 'Type and press Add'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={add}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
            >
              {v}
              {!readOnly && (
                <button
                  type="button"
                  className="rounded-full hover:bg-background/80"
                  onClick={() => onChange(values.filter((x) => x !== v))}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
