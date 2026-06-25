import { Navigate } from 'react-router-dom';
import { store } from '@/store';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = store.getState().auth.user;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function SyncRoute({ children }: { children: React.ReactNode }) {
  const user = store.getState().auth.user;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
