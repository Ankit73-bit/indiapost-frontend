import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage }     from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage }   from '@/pages/ClientsPage';
import { ListsPage }     from '@/pages/ListsPage';
import { ArticlesPage }  from '@/pages/ArticlesPage';
import { SyncPage }      from '@/pages/SyncPage';
import { UsersPage }     from '@/pages/UsersPage';
import { ProfilePage }   from '@/pages/ProfilePage';
import { NoticeTemplatesPage } from '@/pages/notice/NoticeTemplatesPage';
import { NoticeExcelPage } from '@/pages/notice/NoticeExcelPage';

// Admin-only guard
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = store.getState().auth.user;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Admin-only guard (redirects customers away from sync)
function SyncRoute({ children }: { children: React.ReactNode }) {
  const user = store.getState().auth.user;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedTheme}
    />
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemedToaster />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes live inside AppShell */}
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="lists"    element={<ListsPage />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="profile"  element={<ProfilePage />} />
            <Route path="sync"     element={<SyncRoute><SyncPage /></SyncRoute>} />
            <Route path="notice-generator/templates" element={<NoticeTemplatesPage />} />
            <Route path="notice-generator/excel" element={<NoticeExcelPage />} />

            {/* Admin-only */}
            <Route path="clients" element={<AdminRoute><ClientsPage /></AdminRoute>} />
            <Route path="users"   element={<AdminRoute><UsersPage /></AdminRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
