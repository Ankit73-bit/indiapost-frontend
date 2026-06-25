import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoticeExcelErrorStateProps {
  errorMsg: string;
  onReset: () => void;
}

export function NoticeExcelErrorState({
  errorMsg,
  onReset,
}: NoticeExcelErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-destructive">Generation failed</p>
          <p className="mt-1 break-words text-sm text-destructive/80">{errorMsg}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
