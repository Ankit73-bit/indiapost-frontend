import { Copy, Star, Loader2 } from 'lucide-react';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionDetailHeaderProps {
  selectedVersion: string;
  detailVersion: NoticeTemplateVersion;
  isDefault: boolean;
  canActivate: boolean | undefined;
  activating: boolean;
  creatingVersion: boolean;
  onMarkDefault: () => void;
  onDuplicateVersion: () => void;
}

export function NoticeTemplateVersionDetailHeader({
  selectedVersion,
  detailVersion,
  isDefault,
  canActivate,
  activating,
  creatingVersion,
  onMarkDefault,
  onDuplicateVersion,
}: NoticeTemplateVersionDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-lg font-semibold">{selectedVersion}</span>
          <NoticeVersionStatusBadge
            status={detailVersion.status}
            showDefault={isDefault}
          />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Updated {formatDate(detailVersion.updatedAt)}
          {detailVersion.metadata.description
            ? ` · ${detailVersion.metadata.description}`
            : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {canActivate && (
          <Button size="sm" onClick={() => void onMarkDefault()} disabled={activating}>
            {activating ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Star className="mr-1 h-4 w-4" />
            )}
            Set as default
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => void onDuplicateVersion()}
          disabled={creatingVersion}
        >
          <Copy className="mr-1 h-4 w-4" />
          Duplicate
        </Button>
      </div>
    </div>
  );
}
