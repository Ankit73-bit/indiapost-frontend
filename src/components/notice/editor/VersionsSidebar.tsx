import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VersionSidebarItem } from './VersionSidebarItem';
import { sortVersionsDesc } from './versionsSidebar.utils';
import type { VersionsSidebarProps } from './versionsSidebar.types';

export function VersionsSidebar({
  versions,
  activeVersion,
  activeVersionId,
  onSelectVersion,
  onAddVersion,
  isAddingVersion,
  onActivate,
  onDeactivate,
  isActivating,
  isDeactivating,
}: VersionsSidebarProps) {
  const sorted = sortVersionsDesc(versions);

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <p className="text-sm font-medium text-foreground">Versions</p>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          disabled={isAddingVersion || !onAddVersion}
          onClick={onAddVersion}
          title="New draft version (clone)"
        >
          {isAddingVersion ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {sorted.map((version) => (
          <VersionSidebarItem
            key={version.version}
            version={version}
            isSelected={version.version === activeVersion}
            isDefault={version.version === activeVersionId}
            isActivating={isActivating}
            isDeactivating={isDeactivating}
            onSelectVersion={onSelectVersion}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        ))}
      </div>
    </aside>
  );
}
