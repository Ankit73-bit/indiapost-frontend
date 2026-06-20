import { Check, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NoticeStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function NoticeStepIndicator({
  steps,
  currentIndex,
}: {
  steps: NoticeStep[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
            <div
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                active && 'bg-primary/10 text-primary',
                done && !active && 'text-emerald-600 dark:text-emerald-400',
                !active && !done && 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && !active && 'border-emerald-500 bg-emerald-500 text-white',
                )}
              >
                {done && !active ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="truncate">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}
