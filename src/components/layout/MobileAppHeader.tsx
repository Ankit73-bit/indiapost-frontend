import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileAppHeaderProps {
  onOpenNav: () => void;
}

export function MobileAppHeader({ onOpenNav }: MobileAppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onOpenNav}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <span className="truncate text-sm font-semibold tracking-tight">
        IndiaPost CRM
      </span>
    </header>
  );
}
