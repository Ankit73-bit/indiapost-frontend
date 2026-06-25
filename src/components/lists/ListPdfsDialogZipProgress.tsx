import { ZipDownloadProgress } from '@/components/lists/ZipDownloadProgress';
import type { ZipDownloadTask } from '@/components/lists/ZipDownloadProvider';

interface ListPdfsDialogZipProgressProps {
  listZipTask: ZipDownloadTask | undefined;
  onCancel: (taskId: string) => void;
}

export function ListPdfsDialogZipProgress({
  listZipTask,
  onCancel,
}: ListPdfsDialogZipProgressProps) {
  if (!listZipTask) return null;

  if (listZipTask.job) {
    return (
      <ZipDownloadProgress
        job={listZipTask.job}
        label={listZipTask.label}
        cancelling={listZipTask.cancelling}
        onCancel={() => onCancel(listZipTask.id)}
      />
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      ZIP download started — you can close this dialog and track progress in the banner
      at the top of the page.
    </p>
  );
}
