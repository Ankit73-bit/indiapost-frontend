import type { NoticeTemplate } from '@/types';

export interface NoticeTemplateEditorProps {
  template: NoticeTemplate;
  listUrl: string;
  onTemplateUpdated?: (template: NoticeTemplate) => void;
}

export interface UseNoticeTemplateEditorOptions {
  initialTemplate: NoticeTemplate;
  onTemplateUpdated?: (template: NoticeTemplate) => void;
}
