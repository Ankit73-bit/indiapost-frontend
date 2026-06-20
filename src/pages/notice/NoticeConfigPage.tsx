import { Settings2 } from 'lucide-react';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';

export function NoticeConfigPage() {
  const { clientId, selectedClient } = useNoticeClientContext();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Config</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Global notice generator settings for{' '}
            {selectedClient ? selectedClient.name : 'your account'}.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-20 text-center">
        <div className="rounded-full bg-muted p-4">
          <Settings2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="font-medium">Config settings coming soon</p>
          <p className="text-sm text-muted-foreground">
            This section will hold shared defaults and client-level notice generator
            configuration.
          </p>
        </div>
        {!clientId && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Select a client to scope configuration.
          </p>
        )}
      </div>
    </div>
  );
}
