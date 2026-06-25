import type { ReactNode, ElementType } from 'react';
import type { Article, List, NormalizedStatus, PaginationMeta } from '@/types';

export type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export type DetailRowProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export type RecipientLineProps = {
  icon: ElementType;
  children: ReactNode;
};

export type ArticleSheetProps = {
  article: Article;
  isAdmin: boolean;
  onClose: () => void;
};

export type NoContextStateProps = {
  isAdmin: boolean;
};

export type RecentListCardProps = {
  clientId: string;
  listId: string;
  isMostRecent: boolean;
};

export type ListPickerProps = {
  clientId: string;
  isAdmin: boolean;
};

export type ListContextBarProps = {
  clientId: string;
  listId: string;
  isAdmin: boolean;
  totalArticles?: number;
  onOpenPdfs: () => void;
};

export type ArticlesListViewProps = {
  clientId: string;
  listId: string;
  isAdmin: boolean;
};

export type ArticlesFiltersBarProps = {
  searchPlaceholder: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  articleFilterActiveCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  statusFilter: NormalizedStatus | undefined;
  onStatusFilterChange: (status: NormalizedStatus | undefined) => void;
  syncFailedOnly: boolean;
  onSyncFailedOnlyToggle: () => void;
  nonTerminalOnly: boolean;
  onNonTerminalOnlyToggle: () => void;
  listNonTerminalCount: number;
  selectedSyncCount: number;
  syncingSelected: boolean;
  isListSyncing: boolean;
  onSyncSelected: () => void;
  exporting: boolean;
  meta: PaginationMeta | undefined;
  onExport: () => void;
};

export type ArticlesTableProps = {
  isError: boolean;
  isLoading: boolean;
  isImporting: boolean;
  hasActiveFilters: boolean;
  syncFailedOnly: boolean;
  clientId: string;
  listId: string;
  isAdmin: boolean;
  isListSyncing: boolean;
  articles: Article[];
  extraCols: number;
  hasLoanAccount: boolean;
  hasCustomerId: boolean;
  pdfArticleNumbers: Set<string>;
  selectedArticleId: string | undefined;
  onSelectArticle: (article: Article) => void;
  selectedSyncIds: Set<string>;
  onToggleSyncSelection: (articleId: string) => void;
  headerCheckboxChecked: boolean;
  selectingAllSyncable: boolean;
  onToggleAllSyncable: () => void;
  nonTerminalOnly: boolean;
  listNonTerminalCount: number;
  syncableOnPageCount: number;
  listMeta: List | null | undefined;
  onClearFilters: () => void;
  onRefetch: () => void;
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
};
