import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoticeTemplatePageLoadingProps {
  className?: string;
}

export function NoticeTemplatePageLoading({ className }: NoticeTemplatePageLoadingProps) {
  return (
    <div className={cn(className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
