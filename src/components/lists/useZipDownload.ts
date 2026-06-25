import { createContext, useContext } from 'react';
import type { ZipDownloadContextValue } from '@/components/lists/zipDownloadProvider.types';

export const ZipDownloadContext = createContext<ZipDownloadContextValue | null>(null);

export function useZipDownload(): ZipDownloadContextValue {
  const ctx = useContext(ZipDownloadContext);
  if (!ctx) {
    throw new Error('useZipDownload must be used within ZipDownloadProvider');
  }
  return ctx;
}
