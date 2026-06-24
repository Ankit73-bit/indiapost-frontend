import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, MoreHorizontal, Star } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'active' | 'draft';

export function NoticeTemplatesListPage() {
  const navigate = useNavigate();
  const { clientId, isAdmin } = useNoticeClientContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isLoading } = useListNoticeTemplatesQuery(
    { clientId, page, limit: 20 },
    { skip: !clientId },
  );

  const filtered = useMemo(() => {
    let items = data?.data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (t) =>
          t.noticeName.toLowerCase().includes(q) ||
          t.noticeId.toLowerCase().includes(q),
      );
    }
    if (statusFilter === 'active') {
      items = items.filter((t) => t.activeVersion);
    }
    if (statusFilter === 'draft') {
      items = items.filter((t) =>
        t.versions.some((v) => v.status === 'draft'),
      );
    }
    return items;
  }, [data?.data, search, statusFilter]);

  const createUrl =
    isAdmin && clientId
      ? `/notice-generator/templates/new?clientId=${clientId}`
      : '/notice-generator/templates/new';

  function openTemplate(id: string) {
    const url =
      isAdmin && clientId
        ? `/notice-generator/templates/${id}/editor?clientId=${clientId}`
        : `/notice-generator/templates/${id}/editor`;
    navigate(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="pl-9"
            />
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            {(['all', 'active', 'draft'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                  statusFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <Button asChild disabled={!clientId}>
          <Link to={createUrl}>
            <Plus className="mr-2 h-4 w-4" />
            Create template
          </Link>
        </Button>
      </div>

      <TableShell
        footer={
          data?.meta && data.meta.totalPages > 1 ? (
            <div className="px-4 pb-4">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          ) : undefined
        }
      >
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Template name</th>
              <th className="px-4 py-3 font-medium">Notice ID</th>
              <th className="px-4 py-3 font-medium">Default version</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Versions</th>
              <th className="px-4 py-3 font-medium">Last updated</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : !clientId ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  Select a client to view templates.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <p className="text-muted-foreground">No templates found.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to={createUrl}>Create your first template</Link>
                  </Button>
                </td>
              </tr>
            ) : (
              filtered.map((template) => {
                const activeVer = template.versions.find(
                  (v) => v.version === template.activeVersion,
                );
                const hasDraft = template.versions.some(
                  (v) => v.status === 'draft',
                );
                return (
                  <tr
                    key={template._id}
                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
                    onClick={() => openTemplate(template._id)}
                  >
                    <td className="px-4 py-3 font-medium">{template.noticeName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{template.noticeId}</td>
                    <td className="px-4 py-3">
                      {template.activeVersion ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          {template.activeVersion}
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {activeVer ? (
                        <NoticeVersionStatusBadge status="active" showDefault />
                      ) : hasDraft ? (
                        <NoticeVersionStatusBadge status="draft" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No default</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{template.versions.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(template.updatedAt)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTemplate(template._id)}>
                            Open editor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
