import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticlesTableErrorStateProps {
  onRefetch: () => void;
}

export function ArticlesTableErrorState({ onRefetch }: ArticlesTableErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <AlertCircle className="h-6 w-6 text-destructive" />
      <p className="font-medium">Failed to load articles</p>
      <p className="text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <Button variant="outline" size="sm" onClick={onRefetch}>
        Retry
      </Button>
    </div>
  );
}
