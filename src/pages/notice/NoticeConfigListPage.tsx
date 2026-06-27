import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileJson2,
  Loader2,
  Plus,
  Search,
  Link2,
  Link2Off,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';
import { useNoticeConfigListPage } from '@/hooks/useNoticeConfigListPage';

export function NoticeConfigListPage() {
  const page = useNoticeConfigListPage();

  const createUrl =
    page.isAdmin && page.clientId
      ? `/notice-generator/config/new?clientId=${page.clientId}`
      : '/notice-generator/config/new';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search configs…"
              value={page.search}
              onChange={(e) => page.setSearch(e.target.value)}
              className="pl-9"
              disabled={!page.clientId}
            />
          </div>
        </div>
        <Button asChild disabled={!page.clientId}>
          <Link to={createUrl}>
            <Plus className="mr-1.5 h-4 w-4" />
            New config
          </Link>
        </Button>
      </div>

      {/* Content */}
      {!page.clientId ? (
        <EmptyState message="Select a client to manage configs." />
      ) : page.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : page.allConfigs.length === 0 ? (
        <EmptyState
          message="No configs yet."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to={createUrl}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create first config
              </Link>
            </Button>
          }
        />
      ) : page.configs.length === 0 ? (
        <EmptyState message={`No configs match "${page.search}".`} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.configs.map((config) => {
            const detailUrl =
              page.isAdmin && page.clientId
                ? `/notice-generator/config/${config._id}?clientId=${page.clientId}`
                : `/notice-generator/config/${config._id}`;

            const linkedTemplate = page.templates.find(
              (t) => t._id === config.linkedTemplateId,
            );

            return (
              <Link
                key={config._id}
                to={detailUrl}
                className={cn(
                  'group flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
                  'transition-all hover:border-primary/40 hover:shadow-sm',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileJson2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">
                        {config.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {config.noticeId}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                {config.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {config.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-1.5">
                    {config.linkedTemplateId ? (
                      <>
                        <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="max-w-[140px] truncate text-[11px] text-emerald-700 dark:text-emerald-400">
                          {linkedTemplate?.noticeName ?? 'Linked'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Link2Off className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground">Unlinked</span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(config.updatedAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <FileJson2 className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
