import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { NoticeConfigClientSelectProps } from '@/components/notice/config/noticeConfigForm.types';

export function NoticeConfigClientSelect({
  clients,
  clientId,
  readOnly,
  onClientIdChange,
}: NoticeConfigClientSelectProps) {
  return (
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
  );
}
