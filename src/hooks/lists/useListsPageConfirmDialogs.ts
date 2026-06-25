import { useState } from 'react';
import type { List } from '@/types';

export function useListsPageConfirmDialogs() {
  const [deleteTarget, setDeleteTarget] = useState<List | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [cancelImportTarget, setCancelImportTarget] = useState<List | null>(
    null,
  );
  const [cancelSyncTarget, setCancelSyncTarget] = useState<List | null>(null);
  const [syncTarget, setSyncTarget] = useState<List | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  function handleDeleteClick(list: List) {
    setDeleteError('');
    setDeleteTarget(list);
  }

  function handleCancelImportClose() {
    setCancelImportTarget(null);
    setCancelError('');
  }

  function handleCancelSyncClose() {
    setCancelSyncTarget(null);
    setCancelError('');
  }

  return {
    deleteTarget,
    setDeleteTarget,
    deleteError,
    setDeleteError,
    cancelImportTarget,
    setCancelImportTarget,
    cancelSyncTarget,
    setCancelSyncTarget,
    syncTarget,
    setSyncTarget,
    cancelError,
    setCancelError,
    exportDialogOpen,
    setExportDialogOpen,
    handleDeleteClick,
    handleCancelImportClose,
    handleCancelSyncClose,
  };
}
