import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';

export interface EditorFileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: EditorFileNode[];
}

export interface FilesSidebarProps {
  template: NoticeTemplate;
  version: NoticeTemplateVersion;
  activeFile: string;
  expandedFolders: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onUploadFiles?: (files: FileList) => void;
  isUploading?: boolean;
  readOnly?: boolean;
}

export interface FileTreeNodeProps {
  node: EditorFileNode;
  depth: number;
  activeFile: string;
  expandedFolders: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
}
