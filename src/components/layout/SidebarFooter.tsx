import { LogOut, UserCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { PublicUser } from '@/types';

interface SidebarFooterProps {
  user: PublicUser | null;
  onProfile: () => void;
  onLogout: () => void;
}

export function SidebarFooter({ user, onProfile, onLogout }: SidebarFooterProps) {
  const displayName = user?.name || user?.email || '';

  return (
    <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
      <ThemeToggle
        variant="sidebar"
        className="mb-2 h-8 w-full justify-start gap-2.5 px-2 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      />
      <button
        type="button"
        onClick={onProfile}
        className="mb-2 flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
      >
        <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {user?.role}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}
