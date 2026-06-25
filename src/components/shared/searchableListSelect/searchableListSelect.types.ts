import type { ListStatus } from '@/types';

export interface SearchableListSelectProps {
  clientId?: string;
  value?: string;
  onChange: (listId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** When false, menu renders inline (use inside dialogs). Default true. */
  portaled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string;
  excludeStatuses?: ListStatus[];
}

export interface SearchableListSelectMenuProps {
  clientId: string;
  value?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onChange: (listId: string) => void;
  onClose: () => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string;
  excludeStatuses?: ListStatus[];
  portaled?: boolean;
}
