import { useState } from 'react';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import { useTriggerSyncMutation } from '@/store/api/syncApi';
import {
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
} from '@/store/api/listsApi';
import { getApiErrorMessage } from '@/lib/helpers';
import type { List } from '@/types';

export function useListsPageActions({
  setOpsPollForced,
  deleteTarget,
  setDeleteTarget,
  setDeleteError,
  cancelImportTarget,
  setCancelImportTarget,
  cancelSyncTarget,
  setCancelSyncTarget,
  syncTarget,
  setSyncTarget,
  setCancelError,
}: {
  setOpsPollForced: (forced: boolean) => void;
  deleteTarget: List | null;
  setDeleteTarget: (list: List | null) => void;
  setDeleteError: (error: string) => void;
  cancelImportTarget: List | null;
  setCancelImportTarget: (list: List | null) => void;
  cancelSyncTarget: List | null;
  setCancelSyncTarget: (list: List | null) => void;
  syncTarget: List | null;
  setSyncTarget: (list: List | null) => void;
  setCancelError: (error: string) => void;
}) {
  const [uploadingListId, setUploadingListId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [exportingListId, setExportingListId] = useState<string | null>(null);

  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [uploadFile] = useUploadListFileMutation();
  const [cancelImport, { isLoading: cancellingImport }] =
    useCancelImportMutation();
  const [cancelSync, { isLoading: cancellingSync }] = useCancelSyncMutation();
  const [triggerSync, { isLoading: triggeringSync }] = useTriggerSyncMutation();

  async function handleFileUpload(listId: string, file: File) {
    setUploadingListId(listId);
    setUploadError('');
    setOpsPollForced(true);
    try {
      await uploadFile({ listId, file }).unwrap();
      toast.success('Import started — progress updates on this page');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to start import.');
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingListId(null);
    }
  }

  async function handleDeleteList() {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await deleteList(deleteTarget._id).unwrap();
      setDeleteTarget(null);
      toast.success('List deleted');
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete list.'));
    }
  }

  async function handleCancelImport() {
    if (!cancelImportTarget) return;
    setCancelError('');
    try {
      await cancelImport(cancelImportTarget._id).unwrap();
      setCancelImportTarget(null);
      toast.success('Import cancelled — you can upload again');
    } catch (err) {
      setCancelError(getApiErrorMessage(err, 'Failed to cancel import.'));
    }
  }

  async function handleCancelSync() {
    if (!cancelSyncTarget) return;
    setCancelError('');
    try {
      await cancelSync(cancelSyncTarget._id).unwrap();
      setCancelSyncTarget(null);
      toast.success('Sync reset — you can trigger sync again');
    } catch (err) {
      setCancelError(getApiErrorMessage(err, 'Failed to reset sync.'));
    }
  }

  async function handleExport(listId: string, listName: string) {
    setExportingListId(listId);
    try {
      await downloadListExport(listId, listName);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingListId(null);
    }
  }

  async function handleTriggerSync() {
    if (!syncTarget) return;
    setOpsPollForced(true);
    try {
      const result = await triggerSync({
        clientId: syncTarget.clientId,
        listId: syncTarget._id,
      }).unwrap();
      toast.success(result.message);
      setSyncTarget(null);
    } catch (err) {
      toast.apiError(err, 'Failed to trigger sync');
    }
  }

  return {
    uploadingListId,
    uploadError,
    exportingListId,
    deleting,
    cancellingImport,
    cancellingSync,
    triggeringSync,
    handleFileUpload,
    handleDeleteList,
    handleCancelImport,
    handleCancelSync,
    handleExport,
    handleTriggerSync,
  };
}
