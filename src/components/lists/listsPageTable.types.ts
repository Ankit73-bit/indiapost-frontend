import type { Client, List, PaginationMeta } from '@/types';

export interface ListsPageTableProps {
  data: List[] | undefined;
  meta: PaginationMeta | undefined;
  isLoading: boolean;
  hasFilters: boolean;
  liveListById: Map<string, List>;
  activeClients: Client[];
  allClients: Client[] | undefined;
  isAdmin: boolean;
  uploadingListId: string | null;
  exportingListId: string | null;
  triggeringSync: boolean;
  onPageChange: (page: number) => void;
  onRowClick: (list: List) => void;
  onUpload: (listId: string, file: File) => void;
  onExport: (listId: string, listName: string) => void;
  onOpenPdfs: (list: List) => void;
  onTriggerSync: (list: List) => void;
  onEdit: (list: List) => void;
  onDelete: (list: List) => void;
  onCancelImport: (list: List) => void;
  onCancelSync: (list: List) => void;
}

export interface ListsPageTableRowProps {
  list: List;
  activeClients: Client[];
  allClients: Client[] | undefined;
  isAdmin: boolean;
  uploading: boolean;
  exporting: boolean;
  triggeringSync: boolean;
  onRowClick: (list: List) => void;
  onUpload: (file: File) => void;
  onExport: () => void;
  onOpenPdfs: () => void;
  onTriggerSync: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelImport: () => void;
  onCancelSync: () => void;
}
