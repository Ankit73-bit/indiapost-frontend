import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NOTICE_CONFIG_CORE_MAPPING_FIELDS } from '@/components/notice/config/noticeConfigForm.constants';
import type { NoticeConfigCoreMappingCardProps } from '@/components/notice/config/noticeConfigForm.types';
import { cn } from '@/lib/utils';

export function NoticeConfigCoreMappingCard({
  values,
  errors,
  readOnly,
  showWithHeader,
  set,
}: NoticeConfigCoreMappingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Core mapping</CardTitle>
        <CardDescription>
          These fields link your Excel data to the notice template.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {NOTICE_CONFIG_CORE_MAPPING_FIELDS.map((field) => (
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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="max_rows">Max rows</Label>
            <Badge variant="default" className="text-[10px]">
              Required
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Shared limit for table rows and list-field items.
          </p>
          <Input
            id="max_rows"
            type="number"
            min={1}
            value={values.max_rows}
            disabled={readOnly}
            onChange={(e) =>
              set('max_rows', Number.parseInt(e.target.value, 10) || 20)
            }
            className={cn(errors.max_rows && 'border-destructive')}
          />
          {errors.max_rows && (
            <p className="text-xs text-destructive">{errors.max_rows}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center gap-2">
            <Label>Table rotation</Label>
            <Badge variant="secondary" className="text-[10px]">
              Optional
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate one PDF per applicant in the rotation table.
          </p>
          <div className="flex gap-2">
            {([false, true] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                disabled={readOnly}
                onClick={() => set('rotation', v)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm transition-colors',
                  values.rotation === v
                    ? 'border-primary bg-primary/10 font-medium text-primary'
                    : 'border-border hover:bg-muted/50',
                  readOnly && 'cursor-not-allowed opacity-60',
                )}
              >
                {v ? 'Enabled' : 'Disabled'}
              </button>
            ))}
          </div>
        </div>

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
  );
}
