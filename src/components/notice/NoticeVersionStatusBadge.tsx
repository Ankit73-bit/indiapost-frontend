import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NoticeVersionStatus } from '@/types';

const STYLES: Record<NoticeVersionStatus, string> = {
  draft: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  inactive: 'border-border bg-muted text-muted-foreground',
};

export function NoticeVersionStatusBadge({
  status,
  className,
  showDefault,
}: {
  status: NoticeVersionStatus;
  className?: string;
  showDefault?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn('capitalize', STYLES[status], className)}
    >
      {showDefault && status === 'active' ? 'Default' : status}
    </Badge>
  );
}
