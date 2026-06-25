import type { Client } from '@/types';

export interface CurrentListFilters {
  clientId?: string;
  year?: number;
  month?: number;
  noticeType?: string;
}

export interface ExportListsDialogProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  clients: Client[];
  defaultClientId?: string;
  noticeTypeOptions: string[];
  yearOptions: number[];
  currentFilters: CurrentListFilters;
  onSuccess?: () => void;
}

export type ExportListsDialogFormProps = Omit<ExportListsDialogProps, 'open'>;
