import { Star } from 'lucide-react';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeVersionListItemProps {
  version: NoticeTemplateVersion;
  isSelected: boolean;
  isDefault: boolean;
  onSelect: () => void;
}

export function NoticeVersionListItem({
  version,
  isSelected,
  isDefault,
  onSelect,
}: NoticeVersionListItemProps) {
  const typCount = version.fileNames.filter((f) => f.endsWith('.typ')).length;
  const imgCount = version.fileNames.filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).length;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
          isSelected
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
            : 'border-border hover:bg-muted/40',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold">{version.version}</span>
          {isDefault && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <NoticeVersionStatusBadge
            status={version.status}
            showDefault={isDefault}
            className="text-[10px]"
          />
          <span className="tabular-nums text-[10px] text-muted-foreground">
            {formatDate(version.updatedAt)}
          </span>
        </div>
        {version.fileNames.length > 0 && (
          <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
            {typCount} .typ · {imgCount} img
          </p>
        )}
      </button>
    </li>
  );
}
