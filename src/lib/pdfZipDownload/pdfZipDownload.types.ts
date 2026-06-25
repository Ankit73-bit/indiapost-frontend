export type PdfZipJobStatus = {
  jobId: string;
  status: 'building' | 'ready' | 'failed' | 'cancelled';
  processed: number;
  total: number;
  percent: number;
  phase: 'generating' | 'compressing' | 'uploading';
  startedAt: string;
  finishedAt?: string;
  error?: string;
  fileName?: string;
  downloadUrl?: string;
  etaSeconds: number | null;
};

export type PdfZipJobPhase = PdfZipJobStatus['phase'];
