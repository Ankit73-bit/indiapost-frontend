import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  filterNavItems,
  NAV_ITEMS,
  type NavGroupItem,
  type NavLeaf,
} from '@/config/nav';

function isPathActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isGroupActive(pathname: string, children: NavLeaf[]): boolean {
  return children.some((child) => isPathActive(pathname, child.to, child.end));
}

function SidebarNavLink({
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

function SidebarNavGroup({
  group,
  onNavigate,
}: {
  group: NavGroupItem;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const childActive = isGroupActive(pathname, group.children);
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const Icon = group.icon;

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors',
          childActive
            ? 'text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="ml-3 space-y-0.5 border-l border-sidebar-border pl-2">
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.to}
              {...child}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
