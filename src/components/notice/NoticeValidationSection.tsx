import { cn } from '@/lib/utils';

export type ValidationSectionVariant = 'default' | 'warning' | 'muted';

interface NoticeValidationSectionProps {
  title: string;
  items: string[];
  variant?: ValidationSectionVariant;
  empty: string;
}

export function NoticeValidationSection({
  title,
  items,
  variant = 'default',
  empty,
}: NoticeValidationSectionProps) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className={cn(
                'rounded-full px-2 py-0.5 font-mono text-xs',
                variant === 'warning' && 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                variant === 'muted' && 'bg-muted text-muted-foreground',
                variant === 'default' && 'bg-background ring-1 ring-border',
              )}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
