import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavLeaf } from '@/config/nav';

export function SidebarNavLink({
  to,
  label,
  end,
  nested,
  onNavigate,
}: NavLeaf & { nested?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded px-3 py-2 text-sm transition-colors',
          nested ? 'gap-2 py-1.5' : 'gap-2.5',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      {nested && (
        <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
      )}
      {label}
    </NavLink>
  );
}
