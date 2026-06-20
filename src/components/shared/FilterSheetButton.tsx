import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { isSearchableSelectMenuTarget } from '@/lib/searchableSelect';

interface FilterSheetButtonProps {
  title?: string;
  description?: string;
  activeCount?: number;
  onClear?: () => void;
  clearDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FilterSheetButton({
  title = 'Filters',
  description,
  activeCount = 0,
  onClear,
  clearDisabled,
  children,
  className,
}: FilterSheetButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={activeCount > 0 ? 'default' : 'outline'}
        size="sm"
        className={cn('gap-1.5 shrink-0', className)}
        onClick={() => setOpen(true)}
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
            {activeCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
          onInteractOutside={(e) => {
            if (isSearchableSelectMenuTarget(e.target)) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (isSearchableSelectMenuTarget(e.target)) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>

          <SheetFooter className="flex-row gap-2 sm:justify-between">
            {onClear && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={clearDisabled}
                onClick={() => {
                  onClear();
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface FilterFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

export function FilterField({ label, hint, children }: FilterFieldProps) {
  return (
    <div className="relative space-y-1.5 overflow-visible">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {hint}
      </div>
      {children}
    </div>
  );
}
