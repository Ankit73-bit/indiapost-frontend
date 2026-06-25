import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { isProgressStuck } from '@/lib/listProgress';
import type { List } from '@/types';

interface ListsPageAlertsProps {
  customerInactive: boolean;
  importingLists: List[];
  syncingLists: List[];
  uploadError: string;
}

export function ListsPageAlerts({
  customerInactive,
  importingLists,
  syncingLists,
  uploadError,
}: ListsPageAlertsProps) {
  return (
    <>
      {customerInactive && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Your client account is deactivated. Lists are hidden until an admin
          reactivates the client.
        </div>
      )}

      {importingLists.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="flex items-center gap-1.5 font-medium">
            Import in progress ({importingLists.length} list
            {importingLists.length !== 1 ? 's' : ''})
            <HelpTooltip content="Processing runs on the server — refreshing or closing this page does not stop it. Progress updates every few seconds below." />
          </p>
          {importingLists.some((l) => isProgressStuck(l.importProgress)) && (
            <p className="mt-1 text-xs text-amber-800/90 font-medium">
              Progress stalled — use Cancel in the row menu to reset and upload
              again.
            </p>
          )}
        </div>
      )}

      {syncingLists.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="flex items-center gap-1.5 font-medium">
            Sync in progress ({syncingLists.length} list
            {syncingLists.length !== 1 ? 's' : ''})
            <HelpTooltip content="India Post tracking sync runs on the server. Progress updates every few seconds below." />
          </p>
        </div>
      )}

      {uploadError && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}
    </>
  );
}
