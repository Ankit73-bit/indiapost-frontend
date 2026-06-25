import { useRef } from 'react';
import type { List } from '@/types';
import type { ListActionsMenuProps } from '@/components/lists/listActionsMenu.types';

export function useListActionsMenu(list: List, isAdmin: boolean) {
  const isBusy = list.status === 'IMPORTING' || list.status === 'SYNCING';
  const canSync = isAdmin && !isBusy && list.totalArticles > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return {
    isBusy,
    canSync,
    fileInputRef,
  };
}

export type UseListActionsMenuReturn = ReturnType<typeof useListActionsMenu>;

export type { ListActionsMenuProps };
