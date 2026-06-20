import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NoticeTablesListEditors } from '@/components/notice/NoticeTablesListEditors';
import {
  DEFAULT_NOTICE_CONFIG_FORM,
  type NoticeConfigFormValues,
} from '@/lib/noticeConfig';
import { cn } from '@/lib/utils';
import type { Client, DateOutputStyle } from '@/types';

interface NoticeConfigFormProps {
  values: NoticeConfigFormValues;
  onChange: (values: NoticeConfigFormValues) => void;
  clients?: Client[];
  clientId: string;
  onClientIdChange?: (id: string) => void;
  isAdmin?: boolean;
  uploadedFileName?: string | null;
  errors?: Partial<Record<keyof NoticeConfigFormValues, string>>;
  readOnly?: boolean;
  showWithHeader?: boolean;
}

function TagListField({
  label,
  required,
  hint,
  values,
  onChange,
  placeholder,
  error,
  readOnly,
}: {
  label: string;
  required: boolean;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}) {
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

const DATE_STYLES: { value: DateOutputStyle; label: string }[] = [
  { value: 'dd-mm-yyyy', label: 'dd-mm-yyyy (e.g. 17-06-2026)' },
  { value: 'dd-mmm-yyyy', label: 'dd-mmm-yyyy (e.g. 17-Jun-2026)' },
];

export function NoticeConfigForm({
  values,
  onChange,
  clients,
  clientId,
  onClientIdChange,
  isAdmin,
  uploadedFileName,
  errors = {},
  readOnly = false,
  showWithHeader = true,
}: NoticeConfigFormProps) {
  function set<K extends keyof NoticeConfigFormValues>(
    key: K,
    value: NoticeConfigFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      {uploadedFileName && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          Loaded from <span className="font-mono font-medium">{uploadedFileName}</span>
          — review and edit fields below.
        </div>
      )}

      {isAdmin && clients && onClientIdChange && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Client</Label>
            <Badge variant="default" className="text-[10px]">
              Required
            </Badge>
          </div>
          <select
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            disabled={readOnly}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Core mapping</CardTitle>
          <CardDescription>
            These fields link your Excel data to the notice template.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { key: 'notice_id', label: 'Notice ID', required: true },
              { key: 'notice_name', label: 'Notice name', required: true },
              { key: 'id_field', label: 'ID field', required: true },
              { key: 'sort_field', label: 'Sort field', required: false },
            ] as const
          ).map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Badge
                  variant={field.required ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {field.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <Input
                id={field.key}
                value={values[field.key]}
                disabled={readOnly}
                onChange={(e) => set(field.key, e.target.value)}
                className={cn(errors[field.key] && 'border-destructive')}
              />
              {errors[field.key] && (
                <p className="text-xs text-destructive">{errors[field.key]}</p>
              )}
            </div>
          ))}

          {showWithHeader && (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Label>With header</Label>
                <Badge variant="default" className="text-[10px]">
                  Required
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Whether the PDF includes the letterhead header block.
              </p>
              <div className="flex gap-2">
                {([false, true] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    disabled={readOnly}
                    onClick={() => set('with_header', v)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm transition-colors',
                      values.with_header === v
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'border-border hover:bg-muted/50',
                      readOnly && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {v ? 'Yes — with header' : 'No — without header'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Date output</CardTitle>
          <CardDescription>How dates appear in generated PDFs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Date output style</Label>
            <select
              value={values.date_output_style}
              disabled={readOnly}
              onChange={(e) =>
                set('date_output_style', e.target.value as DateOutputStyle)
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {DATE_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Column mapping</CardTitle>
          <CardDescription>
            Add Excel column names that map to template placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <TagListField
            label="Additional fields"
            required={false}
            hint="Extra columns passed to the template."
            values={values.additional_fields}
            onChange={(v) => set('additional_fields', v)}
            readOnly={readOnly}
          />
          <TagListField
            label="Date fields"
            required={false}
            hint="Columns containing dates to format."
            values={values.date_fields}
            onChange={(v) => set('date_fields', v)}
            readOnly={readOnly}
          />
          <TagListField
            label="Decimal fields"
            required={false}
            hint="Columns formatted as decimal numbers."
            values={values.decimal_fields}
            onChange={(v) => set('decimal_fields', v)}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      <NoticeTablesListEditors
        values={values}
        onChange={onChange}
        readOnly={readOnly}
      />

      {!readOnly && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Version notes</Label>
            <Badge variant="secondary" className="text-[10px]">
              Optional
            </Badge>
          </div>
          <Input
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="e.g. BHFL assignment notice — initial draft"
          />
        </div>
      )}
    </div>
  );
}

export { DEFAULT_NOTICE_CONFIG_FORM };
