import type { ExportCurrentFilters } from '@/pages/lists/listsPage.types';
import type { Client, List } from '@/types';

export interface ListsPageConfirmDialogsProps {
  deleteTarget: List | null;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
  deleting: boolean;
  deleteError: string;
  cancelImportTarget: List | null;
  onCancelImportClose: () => void;
  onCancelImportConfirm: () => void;
  cancellingImport: boolean;
  cancelSyncTarget: List | null;
  onCancelSyncClose: () => void;
  onCancelSyncConfirm: () => void;
  cancellingSync: boolean;
  cancelError: string;
  syncTarget: List | null;
  onSyncClose: () => void;
  onSyncConfirm: () => void;
  triggeringSync: boolean;
  exportDialogOpen: boolean;
  onExportClose: () => void;
  isAdmin: boolean;
  activeClients: Client[];
  defaultClientId: string | undefined;
  noticeTypeOptions: string[];
  yearOptions: number[];
  currentFilters: ExportCurrentFilters;
}
