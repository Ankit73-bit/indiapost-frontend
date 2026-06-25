import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarBrandHeader } from '@/components/layout/SidebarBrandHeader';
import { SidebarFooter } from '@/components/layout/SidebarFooter';
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

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-sidebar', className)}>
      <SidebarBrandHeader onNavigate={onNavigate} />
      <SidebarNav isAdmin={isAdmin} onNavigate={onNavigate} />
      <SidebarFooter
        user={user}
        onProfile={goToProfile}
        onLogout={() => void handleLogout()}
      />
    </div>
  );
}
