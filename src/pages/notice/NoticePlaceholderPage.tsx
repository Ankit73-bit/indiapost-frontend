import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface NoticePlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function NoticePlaceholderPage({
  title,
  description,
  icon: Icon,
}: NoticePlaceholderPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} />

      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-1">
          <p className="font-medium text-foreground">Coming soon</p>
          <p className="text-sm text-muted-foreground">
            This section is part of the Notice Generator workflow and will be
            built next.
          </p>
        </div>
      </div>
    </div>
  );
}
