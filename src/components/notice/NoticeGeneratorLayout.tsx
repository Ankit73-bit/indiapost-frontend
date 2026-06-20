import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { cn } from '@/lib/utils';

const SECTION_TABS = [
  { to: '/notice-generator/templates', label: 'Templates', icon: FileText },
  { to: '/notice-generator/excel', label: 'Excel', icon: FileSpreadsheet },
] as const;

export function NoticeGeneratorLayout() {
  const location = useLocation();
  const { clientId, setClientId, isAdmin, activeClients, selectedClient } =
    useNoticeClientContext();

  const isDetailOrCreate =
    /\/templates\/(new|[a-f0-9]{24})/i.test(location.pathname);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border bg-card/40 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notice Generator
              </p>
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                {location.pathname.includes('/excel')
                  ? 'Excel batches'
                  : 'Notice templates'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {location.pathname.includes('/excel')
                  ? 'Upload spreadsheet data and run notice PDF generation jobs.'
                  : 'Manage template versions, configs, and assets — similar to MSG91 template versioning.'}
              </p>
            </div>

            <nav className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
              {SECTION_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.to}
                    to={
                      isAdmin && clientId
                        ? `${tab.to}?clientId=${clientId}`
                        : tab.to
                    }
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {isAdmin && !isDetailOrCreate && (
            <div className="w-full max-w-xs space-y-1.5">
              <Label className="text-xs text-muted-foreground">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {activeClients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedClient && isDetailOrCreate && (
            <p className="text-sm text-muted-foreground">
              Client: <span className="font-medium text-foreground">{selectedClient.name}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
