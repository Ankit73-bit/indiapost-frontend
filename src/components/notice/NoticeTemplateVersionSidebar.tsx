import { Copy, Loader2 } from 'lucide-react';
import { NoticeVersionListItem } from '@/components/notice/NoticeVersionListItem';
import { Button } from '@/components/ui/button';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionSidebarProps {
  sortedVersions: NoticeTemplateVersion[];
  selectedVersion: string;
  activeVersion: string | undefined;
  creatingVersion: boolean;
  onSelectVersion: (version: string) => void;
  onDuplicateVersion: () => void;
}

export function NoticeTemplateVersionSidebar({
  sortedVersions,
  selectedVersion,
  activeVersion,
  creatingVersion,
  onSelectVersion,
  onDuplicateVersion,
}: NoticeTemplateVersionSidebarProps) {
  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Versions
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void onDuplicateVersion()}
          disabled={creatingVersion}
        >
          {creatingVersion ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          New version
        </Button>
      </div>

      <ul className="space-y-1.5">
        {sortedVersions.map((v) => (
          <NoticeVersionListItem
            key={v.version}
            version={v}
            isSelected={v.version === selectedVersion}
            isDefault={activeVersion === v.version}
            onSelect={() => onSelectVersion(v.version)}
          />
        ))}
      </ul>
    </aside>
  );
}
