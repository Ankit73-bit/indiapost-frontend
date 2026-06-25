import type { KeyboardEvent, RefObject } from 'react';

export interface CodeEditorOpenTab {
  path: string;
  label: string;
  dirty?: boolean;
}

export interface CodeEditorPaneProps {
  projectName: string;
  tabs: CodeEditorOpenTab[];
  activeTab: string;
  content: string;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (value: string) => void;
  onSave?: () => void;
  onTogglePreview?: () => void;
  previewOpen?: boolean;
  readOnly?: boolean;
  isSaving?: boolean;
  linkedConfigFile?: string;
  onOpenConfig?: () => void;
}

export interface CodeEditorTabBarProps {
  tabs: CodeEditorOpenTab[];
  activeTab: string;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
  isTypFile: boolean;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  readOnly?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
}

export interface CodeEditorStatusBarProps {
  projectName: string;
  activeTab: string;
  readOnly?: boolean;
  linkedConfigFile?: string;
  onOpenConfig?: () => void;
  lineCount: number;
}

export interface CodeEditorContentProps {
  lines: number[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  content: string;
  readOnly?: boolean;
  onContentChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}
