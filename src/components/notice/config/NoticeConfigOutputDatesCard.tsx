import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NoticeConfigTagListField } from '@/components/notice/config/NoticeConfigTagListField';
import { NOTICE_CONFIG_DATE_STYLES } from '@/components/notice/config/noticeConfigForm.constants';
import type { NoticeConfigOutputDatesCardProps } from '@/components/notice/config/noticeConfigForm.types';
import type { DateOutputStyle } from '@/types';

export function NoticeConfigOutputDatesCard({
  values,
  readOnly,
  set,
}: NoticeConfigOutputDatesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Output & dates</CardTitle>
        <CardDescription>
          Filename columns and how dates are parsed and displayed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <NoticeConfigTagListField
          label="File name columns"
          required={false}
          hint="Excel columns joined with underscore for the output PDF filename."
          values={values.file_name}
          onChange={(v) => set('file_name', v)}
          placeholder="e.g. cuid"
          readOnly={readOnly}
        />
        <div className="space-y-2">
          <Label htmlFor="date_input_format">Date input format</Label>
          <Input
            id="date_input_format"
            value={values.date_input_format}
            disabled={readOnly}
            onChange={(e) => set('date_input_format', e.target.value)}
            placeholder="%Y-%m-%d"
          />
        </div>
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
            {NOTICE_CONFIG_DATE_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
