import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SearchableListSelect } from '@/components/shared/SearchableListSelect';
import { SearchableClientSelect } from '@/components/shared/SearchableClientSelect';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { isSearchableSelectMenuTarget } from '@/lib/searchableSelect';
import { SYNC_ALL_LISTS } from '@/pages/sync/syncPage.constants';
import type { Client } from '@/types';
import type { useListClientsQuery } from '@/store/api/clientsApi';

interface SyncTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientsData: ReturnType<typeof useListClientsQuery>['data'];
  selectedClientId: string;
  selectedListId: string;
  onClientChange: (clientId: string) => void;
  onListChange: (listId: string) => void;
  scopeHint: string;
  triggerError: string;
  onTrigger: () => void;
  triggering: boolean;
}

export function SyncTriggerDialog({
  open,
  onOpenChange,
  clientsData,
  selectedClientId,
  selectedListId,
  onClientChange,
  onListChange,
  scopeHint,
  triggerError,
  onTrigger,
  triggering,
}: SyncTriggerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md overflow-visible"
        onInteractOutside={(e) => {
          if (isSearchableSelectMenuTarget(e.target)) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (isSearchableSelectMenuTarget(e.target)) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Sync</DialogTitle>
        </DialogHeader>
        <div className="min-w-0 space-y-3 py-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Sync scope
            <HelpTooltip content={scopeHint} />
          </div>

          <div className="relative space-y-1.5 overflow-visible">
            <label className="text-xs font-medium text-muted-foreground">
              Client
            </label>
            <SearchableClientSelect
              clients={clientsData?.data.filter((c: Client) => c.isActive) ?? []}
              value={selectedClientId || undefined}
              onChange={(id) => onClientChange(id ?? '')}
              showAllOption={false}
              className="w-full"
              placeholder="Select client"
              portaled={false}
            />
          </div>

          {selectedClientId && (
            <div className="relative min-w-0 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                List
              </label>
              <SearchableListSelect
                clientId={selectedClientId}
                value={selectedListId}
                onChange={(v) => onListChange(v)}
                portaled={false}
                showAllOption
                allOptionValue={SYNC_ALL_LISTS}
                allOptionLabel="All lists (one job per list)"
                excludeStatuses={['IMPORTING', 'SYNCING']}
                placeholder="Select list"
                className="w-full min-w-0"
              />
            </div>
          )}

          {triggerError && (
            <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {triggerError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onTrigger}
            disabled={!selectedClientId || triggering}
          >
            {triggering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Trigger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
