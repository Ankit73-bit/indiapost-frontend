import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import {
  PdfZipDownloadCancelledError,
  runBulkPdfZipDownload,
  runPdfZipDownload,
  type PdfZipJobStatus,
} from '@/lib/pdfZipDownload';
import type { BulkExportFilters } from '@/lib/exportList';

export interface ZipDownloadTask {
  id: string;
  listId: string;
  listName: string;
  label: string;
  job: PdfZipJobStatus | null;
  cancelling: boolean;
}

interface StartZipDownloadOptions {
  listId: string;
  clientId: string;
  listName: string;
  articleNumbers?: string[];
  label: string;
  onComplete?: () => void;
}

interface StartBulkZipDownloadOptions {
  clientId: string;
  clientName: string;
  filters: BulkExportFilters;
  label: string;
  onComplete?: () => void;
}

interface ZipDownloadContextValue {
  tasks: ZipDownloadTask[];
  startZipDownload: (options: StartZipDownloadOptions) => void;
  startBulkZipDownload: (options: StartBulkZipDownloadOptions) => void;
  cancelZipDownload: (taskId: string) => void;
  isListZipBusy: (listId: string) => boolean;
  getListTask: (listId: string) => ZipDownloadTask | undefined;
}

const ZipDownloadContext = createContext<ZipDownloadContextValue | null>(null);

function newTaskId(): string {
  return crypto.randomUUID();
}

export function ZipDownloadProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ZipDownloadTask[]>([]);
  const cancelRefs = useRef(new Map<string, { current: boolean }>());

  const updateTask = useCallback(
    (taskId: string, patch: Partial<ZipDownloadTask>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const removeTask = useCallback((taskId: string) => {
    cancelRefs.current.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const startZipDownload = useCallback(
    (options: StartZipDownloadOptions) => {
      const taskId = newTaskId();
      const cancelRef = { current: false };
      cancelRefs.current.set(taskId, cancelRef);

      setTasks((prev) => [
        ...prev,
        {
          id: taskId,
          listId: options.listId,
          listName: options.listName,
          label: options.label,
          job: null,
          cancelling: false,
        },
      ]);

      void (async () => {
        try {
          const result = await runPdfZipDownload({
            listId: options.listId,
            clientId: options.clientId,
            articleNumbers: options.articleNumbers,
            onProgress: (job) => updateTask(taskId, { job }),
            isCancelled: () => cancelRef.current,
          });
          toast.success(
            `${options.listName}: downloaded ${result.count.toLocaleString()} PDFs as ${result.fileName}`,
          );
          options.onComplete?.();
        } catch (err) {
          if (err instanceof PdfZipDownloadCancelledError) {
            toast.info(`${options.listName}: ZIP download cancelled`);
          } else {
            toast.error(
              getApiErrorMessage(
                err,
                `${options.listName}: failed to download PDFs`,
              ),
            );
          }
        } finally {
          removeTask(taskId);
        }
      })();
    },
    [removeTask, updateTask],
  );

  const startBulkZipDownload = useCallback(
    (options: StartBulkZipDownloadOptions) => {
      const taskId = newTaskId();
      const cancelRef = { current: false };
      cancelRefs.current.set(taskId, cancelRef);
      const bulkListId = `bulk:${options.clientId}`;

      setTasks((prev) => [
        ...prev,
        {
          id: taskId,
          listId: bulkListId,
          listName: options.clientName,
          label: options.label,
          job: null,
          cancelling: false,
        },
      ]);

      void (async () => {
        try {
          const result = await runBulkPdfZipDownload({
            filters: options.filters,
            onProgress: (job) => updateTask(taskId, { job }),
            isCancelled: () => cancelRef.current,
          });
          toast.success(
            `${options.clientName}: downloaded ${result.count.toLocaleString()} PDFs as ${result.fileName}`,
          );
          options.onComplete?.();
        } catch (err) {
          if (err instanceof PdfZipDownloadCancelledError) {
            toast.info(`${options.clientName}: PDF ZIP download cancelled`);
          } else {
            toast.error(
              getApiErrorMessage(
                err,
                `${options.clientName}: failed to download PDFs`,
              ),
            );
          }
        } finally {
          removeTask(taskId);
        }
      })();
    },
    [removeTask, updateTask],
  );

  const cancelZipDownload = useCallback(
    (taskId: string) => {
      const cancelRef = cancelRefs.current.get(taskId);
      if (cancelRef) cancelRef.current = true;
      updateTask(taskId, { cancelling: true });
    },
    [updateTask],
  );

  const isListZipBusy = useCallback(
    (listId: string) =>
      tasks.some(
        (t) =>
          t.listId === listId &&
          (t.job?.status === 'building' || t.cancelling || t.job === null),
      ),
    [tasks],
  );

  const getListTask = useCallback(
    (listId: string) =>
      tasks.find(
        (t) =>
          t.listId === listId &&
          (t.job?.status === 'building' || t.cancelling || t.job === null),
      ),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      startZipDownload,
      startBulkZipDownload,
      cancelZipDownload,
      isListZipBusy,
      getListTask,
    }),
    [tasks, startZipDownload, startBulkZipDownload, cancelZipDownload, isListZipBusy, getListTask],
  );

  return (
    <ZipDownloadContext.Provider value={value}>
      {children}
    </ZipDownloadContext.Provider>
  );
}

export function useZipDownload(): ZipDownloadContextValue {
  const ctx = useContext(ZipDownloadContext);
  if (!ctx) {
    throw new Error('useZipDownload must be used within ZipDownloadProvider');
  }
  return ctx;
}
