import type { NoticeTemplateVersion } from '@/types';

export interface VersionsSidebarProps {
  versions: NoticeTemplateVersion[];
  activeVersion: string;
  activeVersionId?: string;
  onSelectVersion: (version: string) => void;
  onAddVersion?: () => void;
  isAddingVersion?: boolean;
  onActivate?: (version: string) => void;
  onDeactivate?: (version: string) => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
}

export interface VersionSidebarItemProps {
  version: NoticeTemplateVersion;
  isSelected: boolean;
  isDefault: boolean;
  isActivating?: boolean;
  isDeactivating?: boolean;
  onSelectVersion: (version: string) => void;
  onActivate?: (version: string) => void;
  onDeactivate?: (version: string) => void;
}
