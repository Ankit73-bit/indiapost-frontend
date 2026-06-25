import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NoticeConfigTagListField } from '@/components/notice/config/NoticeConfigTagListField';
import type { NoticeConfigColumnMappingCardProps } from '@/components/notice/config/noticeConfigForm.types';

export function NoticeConfigColumnMappingCard({
  values,
  readOnly,
  set,
}: NoticeConfigColumnMappingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Column mapping</CardTitle>
        <CardDescription>
          Add Excel column names that map to template placeholders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <NoticeConfigTagListField
          label="Variable fields"
          required={false}
          hint="Scalar columns passed to the template."
          values={values.variable_fields}
          onChange={(v) => set('variable_fields', v)}
          readOnly={readOnly}
        />
        <NoticeConfigTagListField
          label="Date fields"
          required={false}
          hint="Columns containing dates to format."
          values={values.date_fields}
          onChange={(v) => set('date_fields', v)}
          readOnly={readOnly}
        />
        <NoticeConfigTagListField
          label="Decimal fields"
          required={false}
          hint="Columns formatted as decimal numbers."
          values={values.decimal_fields}
          onChange={(v) => set('decimal_fields', v)}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}
