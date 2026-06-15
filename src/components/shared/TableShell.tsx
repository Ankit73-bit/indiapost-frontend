import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableShellProps {
  children: ReactNode;
  className?: string;
  minWidthClass?: string;
  footer?: ReactNode;
}

export function TableShell({
  children,
  className,
  minWidthClass = 'min-w-[720px]',
  footer,
}: TableShellProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <div className={cn('w-full', minWidthClass)}>{children}</div>
      </div>
      {footer}
    </div>
  );
}
