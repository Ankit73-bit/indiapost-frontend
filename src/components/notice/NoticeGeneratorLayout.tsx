import { Outlet, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';

export function NoticeGeneratorLayout() {
  const location = useLocation();
  const { clientId, setClientId, isAdmin, activeClients, selectedClient } =
    useNoticeClientContext();

  const isDetailOrCreate =
    /\/templates\/(new|[a-f0-9]{24})(\/editor)?/i.test(location.pathname);

  const showClientPicker = isAdmin && !isDetailOrCreate;

  const isEditor = /\/editor$/i.test(location.pathname);

  return (
    <div className={isEditor ? 'flex h-full min-h-0 w-full flex-1 flex-col' : 'flex min-h-0 w-full flex-1 flex-col'}>
      {!isEditor && (showClientPicker || (selectedClient && isDetailOrCreate)) && (
        <div className="mb-4 flex items-center justify-end gap-3">
          {showClientPicker && (
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-xs text-muted-foreground">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-[220px]">
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
              Client:{' '}
              <span className="font-medium text-foreground">{selectedClient.name}</span>
            </p>
          )}
        </div>
      )}

      <Outlet />
    </div>
  );
}
