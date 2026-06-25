export interface ListPdfsDialogProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  clientId: string;
  listName: string;
  listSlug: string;
  isAdmin: boolean;
}

export type ListPdfsDialogBodyProps = Omit<ListPdfsDialogProps, 'open'> & {
  viewingArticle: string | null;
  onViewingArticleChange: (articleNumber: string | null) => void;
};

export interface UseListPdfsDialogBodyOptions {
  listId: string;
  clientId: string;
  listName: string;
  onViewingArticleChange: (articleNumber: string | null) => void;
}
