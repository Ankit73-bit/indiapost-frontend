import type { ReactNode } from 'react';
import { ZipDownloadContext } from '@/components/lists/useZipDownload';
import { useZipDownloadTasks } from '@/components/lists/useZipDownloadTasks';

export type {
  ZipDownloadTask,
  StartZipDownloadOptions,
  StartBulkZipDownloadOptions,
} from '@/components/lists/zipDownloadProvider.types';

export function ZipDownloadProvider({ children }: { children: ReactNode }) {
  const value = useZipDownloadTasks();

  return (
    <ZipDownloadContext.Provider value={value}>
      {children}
    </ZipDownloadContext.Provider>
  );
}
