export interface ListExportFilters {
  status?: string;
  syncFailed?: boolean;
  deliveredFrom?: string;
  deliveredTo?: string;
}

export interface BulkExportFilters {
  clientId: string;
  year?: number;
  month?: number;
  noticeType?: string;
  dispatchFrom?: string;
  dispatchTo?: string;
  status?: string;
  syncFailed?: boolean;
}
