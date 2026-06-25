export interface ClientOption {
  _id: string;
  name: string;
}

export interface SearchableClientSelectProps {
  clients: ClientOption[];
  value: string | undefined;
  onChange: (clientId: string | undefined) => void;
  className?: string;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  portaled?: boolean;
}

export interface SearchableClientSelectMenuProps {
  clients: ClientOption[];
  value: string | undefined;
  menuRef: React.RefObject<HTMLDivElement | null>;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onPick: (clientId: string | undefined) => void;
  showAllOption: boolean;
  allOptionLabel: string;
  portaled: boolean;
  position: { top: number; left: number; width: number };
}
