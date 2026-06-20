import { Loader2 } from 'lucide-react';
import { ZipDownloadProgress } from '@/components/lists/ZipDownloadProgress';
import { useZipDownload } from '@/components/lists/ZipDownloadProvider';
import { isFullWidthAppRoute } from '@/lib/appLayout';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export function ZipDownloadBanner() {
  const location = useLocation();
  const { tasks, cancelZipDownload } = useZipDownload();

  if (tasks.length === 0) return null;

  const fullWidth = isFullWidthAppRoute(location.pathname);

  return (
    <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
      <div className={cn('space-y-2', fullWidth ? 'w-full' : 'mx-auto max-w-7xl')}>
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          PDF ZIP downloads ({tasks.length})
        </span>
        {tasks.map((task) => (
          <ZipDownloadProgress
            key={task.id}
            job={
              task.job ?? {
                jobId: task.id,
                status: 'building',
                processed: 0,
                total: 0,
                percent: 0,
                phase: 'generating',
                startedAt: new Date().toISOString(),
                etaSeconds: null,
              }
            }
            label={`${task.listName} — ${task.label}`}
            cancelling={task.cancelling}
            onCancel={() => cancelZipDownload(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
