import { cn } from '@/lib/utils';
import type {
  DetailSectionProps,
  DetailRowProps,
  RecipientLineProps,
} from '@/pages/articles/articlesPage.types';

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

export function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 px-3 py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'min-w-0 text-right',
          mono && 'font-mono text-xs break-all',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function RecipientLine({ icon: Icon, children }: RecipientLineProps) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2 text-sm">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 wrap-break-word text-muted-foreground">
        {children}
      </span>
    </div>
  );
}
