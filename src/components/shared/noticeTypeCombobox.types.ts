export interface NoticeTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  knownTypes?: string[];
  /** When true, only shows types used by the selected client (no global presets). */
  clientScoped?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
