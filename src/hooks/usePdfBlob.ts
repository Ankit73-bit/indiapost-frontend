import { useEffect, useRef, useState } from 'react';
import { loadPdfBlobUrl } from '@/lib/pdfFiles';
import { getApiErrorMessage } from '@/lib/helpers';

export interface PdfBlobTarget {
  listId: string;
  clientId: string;
  articleNumber: string;
}

export function usePdfBlob(target: PdfBlobTarget | null, enabled: boolean) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  function revokeBlob() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(null);
  }

  useEffect(() => {
    if (!enabled || !target) {
      revokeBlob();
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    revokeBlob();

    void loadPdfBlobUrl(target.listId, target.articleNumber, target.clientId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load PDF'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, target?.listId, target?.clientId, target?.articleNumber]);

  useEffect(() => () => revokeBlob(), []);

  return { blobUrl, loading, error };
}
