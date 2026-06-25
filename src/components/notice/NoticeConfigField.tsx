import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NoticeConfigFieldProps } from '@/components/notice/noticeTablesListEditors.types';

export function NoticeConfigField({
  label,
  value,
  onChange,
  readOnly,
  className,
}: NoticeConfigFieldProps) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
}
