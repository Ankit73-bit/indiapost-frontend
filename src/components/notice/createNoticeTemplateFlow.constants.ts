import { Image as ImageIcon, FileType2 } from 'lucide-react';

export const CREATE_NOTICE_TEMPLATE_STEPS = [
  { id: 'templates', label: 'Templates', icon: FileType2 },
  { id: 'images', label: 'Images', icon: ImageIcon },
] as const;

export type CreateNoticeTemplateStepId =
  (typeof CREATE_NOTICE_TEMPLATE_STEPS)[number]['id'];
