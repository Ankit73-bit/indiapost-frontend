import { Loader2 } from 'lucide-react';

export function NoticeTemplateEditorLoading() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center bg-muted/20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
