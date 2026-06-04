import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage }     from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage }   from '@/pages/ClientsPage';
import { ListsPage }     from '@/pages/ListsPage';
import { ArticlesPage }  from '@/pages/ArticlesPage';
import { SyncPage }      from '@/pages/SyncPage';
import { UsersPage }     from '@/pages/UsersPage';

// Admin-only guard
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = store.getState().auth.user;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes live inside AppShell */}
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="lists"    element={<ListsPage />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="sync"     element={<SyncPage />} />

            {/* Admin-only */}
            <Route path="clients" element={<AdminRoute><ClientsPage /></AdminRoute>} />
            <Route path="users"   element={<AdminRoute><UsersPage /></AdminRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
