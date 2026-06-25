import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { NoticeConfigVersionNotesFieldProps } from '@/components/notice/config/noticeConfigForm.types';

export function NoticeConfigVersionNotesField({
  value,
  onChange,
}: NoticeConfigVersionNotesFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Version notes</Label>
        <Badge variant="secondary" className="text-[10px]">
          Optional
        </Badge>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. BHFL assignment notice — initial draft"
      />
    </div>
  );
}
