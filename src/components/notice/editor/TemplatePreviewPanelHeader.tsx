import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import type { TemplatePreviewPanelHeaderProps } from './templatePreviewPanel.types';

export function TemplatePreviewPanelHeader({
  shortName,
  loading,
  onClose,
  onRefresh,
}: TemplatePreviewPanelHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs font-medium text-foreground">{shortName}</span>
        {loading && (
          <span className="animate-pulse text-[10px] text-muted-foreground">Rendering…</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={loading}
          onClick={onRefresh}
          title="Refresh preview"
        >
          <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClose}
          title="Close preview"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
