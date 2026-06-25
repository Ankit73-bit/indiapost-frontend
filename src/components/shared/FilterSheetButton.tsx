import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSheetContent } from '@/components/shared/FilterSheetContent';
import { cn } from '@/lib/utils';

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

      <FilterSheetContent
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        onClear={onClear}
        clearDisabled={clearDisabled}
      >
        {children}
      </FilterSheetContent>
    </>
  );
}

export { FilterField } from '@/components/shared/FilterField';
