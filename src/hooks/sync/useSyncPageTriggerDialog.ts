import { useState } from 'react';
import { useTriggerSyncMutation } from '@/store/api/syncApi';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import { SYNC_ALL_LISTS } from '@/pages/sync/syncPage.constants';

type UseSyncPageTriggerDialogParams = {
  filterClientId: string;
  filterListId: string;
  setSyncPollForced: (forced: boolean) => void;
};

export function useSyncPageTriggerDialog({
  filterClientId,
  filterListId,
  setSyncPollForced,
}: UseSyncPageTriggerDialogParams) {
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedListId, setSelectedListId] = useState(SYNC_ALL_LISTS);
  const [triggerError, setTriggerError] = useState('');

  const [triggerSync, { isLoading: triggering }] = useTriggerSyncMutation();

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedListId(SYNC_ALL_LISTS);
    setTriggerError('');
  }

  function openTriggerDialog() {
    setSelectedClientId(filterClientId);
    setSelectedListId(filterListId || SYNC_ALL_LISTS);
    setTriggerError('');
    setTriggerDialogOpen(true);
  }

  async function handleTrigger() {
    if (!selectedClientId) return;
    setTriggerError('');
    try {
      const body =
        selectedListId === SYNC_ALL_LISTS
          ? { clientId: selectedClientId }
          : { clientId: selectedClientId, listId: selectedListId };
      const result = await triggerSync(body).unwrap();
      toast.success(result.message);
      if (result.syncJobId) {
        setSyncPollForced(true);
        window.setTimeout(() => setSyncPollForced(false), 12000);
      }
      setTriggerDialogOpen(false);
      setSelectedClientId('');
      setSelectedListId(SYNC_ALL_LISTS);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setTriggerError(msg);
      toast.error(msg);
    }
  }

  function handleListChange(listId: string) {
    setSelectedListId(listId);
    setTriggerError('');
  }

  const scopeHint =
    selectedListId === SYNC_ALL_LISTS
      ? 'Creates one sync job per list that has non-terminal articles for this client.'
      : 'Syncs only non-terminal articles in the selected list.';

  return {
    openTriggerDialog,
    triggerDialogOpen,
    setTriggerDialogOpen,
    selectedClientId,
    selectedListId,
    triggerError,
    scopeHint,
    handleClientChange,
    handleListChange,
    handleTrigger,
    triggering,
  };
}
