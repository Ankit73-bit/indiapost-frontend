import type { RefObject } from 'react';
import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';
import type { TemplateMapEntry } from '@/lib/templateMap';

export interface NoticeTemplateMapPageProps {
  templateId: string;
}

export interface NoticeTemplateMapPageHeaderProps {
  listUrl: string;
  noticeName: string;
  onOpenEditor: () => void;
}

export interface NoticeTemplateMapVersionSelectProps {
  selectedVersion: string;
  sortedVersions: NoticeTemplateVersion[];
  activeVersion?: string;
  isBusy: boolean;
  onVersionChange: (version: string) => void;
}

export interface NoticeTemplateMapEntriesTableProps {
  entries: TemplateMapEntry[];
  typFiles: string[];
  readOnly: boolean;
  isBusy: boolean;
  onUpdateEntry: (
    id: string,
    patch: Partial<Pick<TemplateMapEntry, 'key' | 'value'>>,
  ) => void;
  onRemoveEntry: (id: string) => void;
  onAddEntry: () => void;
}

export interface NoticeTemplateMapActionsProps {
  readOnly: boolean;
  dirty: boolean;
  isBusy: boolean;
  saving: boolean;
  importing: boolean;
  entriesCount: number;
  importRef: RefObject<HTMLInputElement | null>;
  onImport: (file: File) => void;
  onSave: () => void;
  onExport: () => void;
}

export type NoticeTemplateForMap = NoticeTemplate;
