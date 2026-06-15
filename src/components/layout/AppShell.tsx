import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { OperationsBanner } from '@/components/shared/OperationsBanner';
import { ZipDownloadBanner } from '@/components/shared/ZipDownloadBanner';
import { ZipDownloadProvider } from '@/components/lists/ZipDownloadProvider';
import { useAppSelector } from '@/store';

export function AppShell() {
  const token = useAppSelector((s) => s.auth.token);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <ZipDownloadProvider>
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <OperationsBanner />
        <ZipDownloadBanner />
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
    </ZipDownloadProvider>
  );
}
