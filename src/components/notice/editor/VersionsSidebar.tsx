import { CheckCircle2, Loader2, Plus, Star, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NoticeTemplateVersion } from '@/types';
import { formatDate } from '@/lib/helpers';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';

interface VersionsSidebarProps {
  versions: NoticeTemplateVersion[];
  activeVersion: string;
  activeVersionId?: string;
  onSelectVersion: (version: string) => void;
  onAddVersion?: () => void;
  isAddingVersion?: boolean;
  onActivate?: (version: string) => void;
  onDeactivate?: (version: string) => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
}

function versionLabel(version: NoticeTemplateVersion): string {
  const desc = version.metadata?.description?.trim();
  if (desc) return `${version.version} — ${desc}`;
  return version.version;
}

function versionMeta(version: NoticeTemplateVersion, isDefault: boolean): string {
  if (version.status === 'active' && isDefault) return 'Active · default';
  if (version.status === 'draft') return 'Draft';
  if (version.status === 'inactive') return 'Inactive';
  return formatDate(version.updatedAt);
}

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
  const sorted = [...versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );

  const selected = versions.find((v) => v.version === activeVersion);
  const canActivate =
    selected &&
    selected.status !== 'active' &&
    selected.fileNames.some((f) => f.toLowerCase().endsWith('.typ'));
  const canDeactivate = selected?.status === 'active';

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
        {sorted.map((version) => {
          const isSelected = version.version === activeVersion;
          const isDefault = version.version === activeVersionId;
          const thisCanActivate =
            version.status !== 'active' &&
            version.fileNames.some((f) => f.toLowerCase().endsWith('.typ'));
          const thisCanDeactivate = version.status === 'active';
          const actionBusy = isActivating || isDeactivating;

          return (
            <div key={version.version}>
              <button
                type="button"
                onClick={() => onSelectVersion(version.version)}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                  isSelected ? 'bg-muted ring-1 ring-border' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <p
                    className={cn(
                      'min-w-0 flex-1 truncate text-xs font-medium',
                      isSelected ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {version.version}
                  </p>
                  {isDefault && (
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-500" />
                  )}
                </div>
                {version.metadata?.description && (
                  <p className="mt-0.5 truncate pl-3.5 text-[10px] text-muted-foreground/70 italic">
                    {version.metadata.description}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-2 pl-3.5">
                  <NoticeVersionStatusBadge
                    status={version.status}
                    className="h-5 px-1.5 text-[10px]"
                  />
                  <span className="truncate text-[10px] text-muted-foreground">
                    {formatDate(version.updatedAt)}
                  </span>
                </div>
              </button>

              {/* Inline activate/deactivate for selected version */}
              {isSelected && (thisCanActivate || thisCanDeactivate) && (
                <div className="mt-1 px-1">
                  {thisCanActivate && onActivate && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => onActivate(version.version)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400 disabled:opacity-50"
                    >
                      {isActivating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Set active
                    </button>
                  )}
                  {thisCanDeactivate && onDeactivate && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => onDeactivate(version.version)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {isDeactivating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Set inactive
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
