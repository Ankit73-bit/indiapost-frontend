import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { NoticeConfigPdfProtectionCardProps } from '@/components/notice/config/noticeConfigForm.types';

export function NoticeConfigPdfProtectionCard({
  values,
  readOnly,
  set,
}: NoticeConfigPdfProtectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">PDF protection</CardTitle>
        <CardDescription>Template defaults for encrypted PDFs.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password_field">Password field</Label>
          <Input
            id="password_field"
            value={values.password_field}
            disabled={readOnly}
            onChange={(e) => set('password_field', e.target.value)}
            placeholder="Column containing per-row password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_password">Default password</Label>
          <Input
            id="default_password"
            value={values.default_password}
            disabled={readOnly}
            onChange={(e) => set('default_password', e.target.value)}
            placeholder="Fallback when password field is empty"
          />
        </div>
      </CardContent>
    </Card>
  );
}
