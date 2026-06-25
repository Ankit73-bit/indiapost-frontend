import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { isSearchableSelectMenuTarget } from '@/lib/searchableSelect';

interface FilterSheetContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onClear?: () => void;
  clearDisabled?: boolean;
  children: React.ReactNode;
}

export function FilterSheetContent({
  open,
  onOpenChange,
  title,
  description,
  onClear,
  clearDisabled,
  children,
}: FilterSheetContentProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                onOpenChange(false);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
