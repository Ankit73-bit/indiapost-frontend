import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNavLink } from '@/components/layout/SidebarNavLink';
import { isGroupActive } from '@/components/layout/sidebarNav.utils';
import type { NavGroupItem } from '@/config/nav';

export function SidebarNavGroup({
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
