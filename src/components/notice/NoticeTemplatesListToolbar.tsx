import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { STATUS_FILTERS } from '@/pages/notice/noticeTemplatesListPage.constants';
import type { StatusFilter } from '@/pages/notice/noticeTemplatesListPage.types';

type NoticeTemplatesListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  createUrl: string;
  clientId: string | undefined;
};

export function NoticeTemplatesListToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  createUrl,
  clientId,
}: NoticeTemplatesListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or ID…"
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onStatusFilterChange(f)}
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
  );
}
