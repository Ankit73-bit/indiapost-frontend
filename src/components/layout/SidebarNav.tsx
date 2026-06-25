import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarNavGroup } from '@/components/layout/SidebarNavGroup';
import { filterNavItems, NAV_ITEMS } from '@/config/nav';

export function SidebarNav({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const items = filterNavItems(NAV_ITEMS, isAdmin);

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
      {items.map((item) => {
        if (item.kind === 'group') {
          return (
            <SidebarNavGroup
              key={item.label}
              group={item}
              onNavigate={onNavigate}
            />
          );
        }

        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
