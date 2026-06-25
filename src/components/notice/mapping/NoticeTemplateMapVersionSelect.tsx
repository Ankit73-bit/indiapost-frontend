import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NoticeTemplateMapVersionSelectProps } from '@/pages/notice/noticeTemplateMapPage.types';

export function NoticeTemplateMapVersionSelect({
  selectedVersion,
  sortedVersions,
  activeVersion,
  isBusy,
  onVersionChange,
}: NoticeTemplateMapVersionSelectProps) {
  return (
    <div className="grid gap-3 sm:max-w-xs">
      <Label className="text-xs text-muted-foreground">Version</Label>
      <Select value={selectedVersion} onValueChange={onVersionChange} disabled={isBusy}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortedVersions.map((v) => (
            <SelectItem key={v.version} value={v.version}>
              <span className="font-mono">{v.version}</span>
              <span className="ml-2 inline-flex">
                <NoticeVersionStatusBadge
                  status={v.status}
                  showDefault={activeVersion === v.version}
                />
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
