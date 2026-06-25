import { CheckCircle2, Loader2, Star, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { versionHasTypFiles } from './versionsSidebar.utils';
import type { VersionSidebarItemProps } from './versionsSidebar.types';

export function VersionSidebarItem({
  version,
  isSelected,
  isDefault,
  isActivating,
  isDeactivating,
  onSelectVersion,
  onActivate,
  onDeactivate,
}: VersionSidebarItemProps) {
  const thisCanActivate = version.status !== 'active' && versionHasTypFiles(version);
  const thisCanDeactivate = version.status === 'active';
  const actionBusy = isActivating || isDeactivating;

  return (
    <div>
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
}
