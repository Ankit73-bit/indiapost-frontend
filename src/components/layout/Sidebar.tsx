import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  List,
  Package,
  RefreshCw,
  LogOut,
  Mail,
  UserCog,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCredentials } from '@/store/authSlice';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard, end: true,  adminOnly: false, customerHide: false },
  { to: '/clients',  label: 'Clients',   icon: Users,           end: false, adminOnly: true,  customerHide: false },
  { to: '/lists',    label: 'Lists',     icon: List,            end: false, adminOnly: false, customerHide: false },
  { to: '/articles', label: 'Articles',  icon: Package,         end: false, adminOnly: false, customerHide: false },
  { to: '/sync',     label: 'Sync',      icon: RefreshCw,       end: false, adminOnly: false, customerHide: true  },
  { to: '/users',    label: 'Users',     icon: UserCog,         end: false, adminOnly: true,  customerHide: false },
];

export function Sidebar() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const isAdmin   = user?.role === 'admin';

  function handleLogout() {
    dispatch(clearCredentials());
    navigate('/login');
  }

  const displayName = user?.name || user?.email || '';

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <Mail className="h-5 w-5 text-sidebar-primary" />
        <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
          IndiaPost CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS
          .filter((item) => !item.adminOnly || isAdmin)
          .filter((item) => !item.customerHide || isAdmin)
          .map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
              {label}
            </NavLink>
          ))
        }
      </nav>

      {/* Theme + User */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <ThemeToggle
          variant="sidebar"
          className="mb-2 h-8 w-full justify-start gap-2.5 px-2 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        />
        <button
          onClick={() => navigate('/profile')}
          className="mb-2 flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
        >
          <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-sidebar-foreground">{displayName}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user?.role}</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
