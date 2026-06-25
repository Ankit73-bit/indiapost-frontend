import { Loader2, Plus } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { NoticeConfigSidebarProps } from '@/pages/notice/noticeConfigPage.types';

export function NoticeConfigSidebar({
  clientId,
  clientName,
  configs,
  listLoading,
  selectedId,
  isCreating,
  onStartCreate,
  onSelectConfig,
}: NoticeConfigSidebarProps) {
  return (
    <div className="w-full shrink-0 lg:w-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Config</h2>
          <p className="text-xs text-muted-foreground">
            {clientName ? clientName : 'Select a client'}
          </p>
        </div>
        <Button size="sm" disabled={!clientId} onClick={onStartCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New
        </Button>
      </div>

      <TableShell>
        {!clientId ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Select a client to manage configs.
          </p>
        ) : listLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : configs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No configs yet. Create one to get started.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {configs.map((config) => (
              <button
                key={config._id}
                type="button"
                onClick={() => onSelectConfig(config._id)}
                className={cn(
                  'w-full px-4 py-3 text-left transition-colors hover:bg-muted/40',
                  selectedId === config._id && !isCreating && 'bg-muted/60',
                )}
              >
                <p className="truncate text-sm font-medium">{config.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {config.noticeId}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {config.linkedTemplateId ? 'Linked to template' : 'Unlinked'} ·{' '}
                  {formatDate(config.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </TableShell>
    </div>
  );
}
