import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Mail, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCredentials } from '@/store/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

interface SidebarContentProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';

  const [logout] = useLogoutMutation();

  async function handleLogout() {
    onNavigate?.();
    try {
      await logout().unwrap();
    } catch {
      // Clear local state even if the server call fails
    }
    dispatch(clearCredentials());
    navigate('/login');
  }

  function goToProfile() {
    onNavigate?.();
    navigate('/profile');
  }

  const displayName = user?.name || user?.email || '';

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-sidebar', className)}>
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

      <SidebarNav isAdmin={isAdmin} onNavigate={onNavigate} />

      <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
        <ThemeToggle
          variant="sidebar"
          className="mb-2 h-8 w-full justify-start gap-2.5 px-2 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        />
        <button
          type="button"
          onClick={goToProfile}
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
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
