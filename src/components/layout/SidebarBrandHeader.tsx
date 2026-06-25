import { NavLink } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarBrandHeaderProps {
  onNavigate?: () => void;
}

export function SidebarBrandHeader({ onNavigate }: SidebarBrandHeaderProps) {
  return (
    <NavLink
      to="/"
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4 transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      <Mail className="h-5 w-5 shrink-0 text-sidebar-primary" />
      <span className="text-sm font-semibold tracking-tight">IndiaPost CRM</span>
    </NavLink>
  );
}
