export interface SearchableNoticeTypeSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  portaled?: boolean;
}

export interface SearchableNoticeTypeSelectMenuProps {
  options: string[];
  value: string;
  menuRef: React.RefObject<HTMLDivElement | null>;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onPick: (value: string) => void;
  placeholder: string;
  portaled: boolean;
  position: { top: number; left: number; width: number };
}
