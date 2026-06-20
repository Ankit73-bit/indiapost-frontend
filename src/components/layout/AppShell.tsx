import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarContent } from './SidebarContent';
import { MobileAppHeader } from './MobileAppHeader';
import { OperationsBanner } from '@/components/shared/OperationsBanner';
import { ZipDownloadBanner } from '@/components/shared/ZipDownloadBanner';
import { ZipDownloadProvider } from '@/components/lists/ZipDownloadProvider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppSelector } from '@/store';
import { isFullWidthAppRoute } from '@/lib/appLayout';

export function AppShell() {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  if (!token) return <Navigate to="/login" replace />;

  const isFullWidth = isFullWidthAppRoute(location.pathname);

  return (
    <ZipDownloadProvider>
      <TooltipProvider delayDuration={300}>
      <div className="flex h-full min-h-0 overflow-hidden bg-background">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <MobileAppHeader onOpenNav={() => setMobileNavOpen(true)} />

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent
              side="left"
              className="w-[min(18rem,88vw)] gap-0 border-r border-sidebar-border bg-sidebar p-0 sm:max-w-xs"
            >
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <OperationsBanner />
            <ZipDownloadBanner />
            <div
              className={
                isFullWidth
                  ? 'w-full px-4 py-4 sm:px-6'
                  : 'mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6'
              }
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      </TooltipProvider>
    </ZipDownloadProvider>
  );
}
