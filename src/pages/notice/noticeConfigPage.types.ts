import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeConfigRecord, NoticeTemplate } from '@/types';

export type NoticeConfigListItem = Pick<
  NoticeConfigRecord,
  '_id' | 'name' | 'noticeId' | 'linkedTemplateId' | 'updatedAt'
>;

export type NoticeConfigTemplateOption = Pick<
  NoticeTemplate,
  '_id' | 'noticeName' | 'noticeId' | 'linkedConfigId'
>;

export type NoticeConfigEditorUrlBuilder = (templateId: string) => string;

export type NoticeConfigEditorProps = {
  clientId: string;
  configId?: string;
  templates: NoticeConfigTemplateOption[];
  onCreated?: (id: string) => void;
  onCancel?: () => void;
  onDeleted?: () => void;
  editorUrl: NoticeConfigEditorUrlBuilder;
};

export type NoticeConfigTemplateLinkSectionProps = {
  isNew: boolean;
  templates: NoticeConfigTemplateOption[];
  linkTemplateId: string;
  onLinkTemplateIdChange: (id: string) => void;
  linkedTemplate: NoticeConfigTemplateOption | undefined;
  recordLinkedTemplateId: string | undefined;
  editorUrl: NoticeConfigEditorUrlBuilder;
  configFileName: string;
  onConfigFileNameChange: (name: string) => void;
  onLink: () => void;
  onUnlink: () => void;
  linking: boolean;
  unlinking: boolean;
};

export type NoticeConfigEditorHeaderProps = {
  isNew: boolean;
  title: string | undefined;
  noticeId: string | undefined;
  creating: boolean;
  saving: boolean;
  deleting: boolean;
  onCancel?: () => void;
  onDelete: () => void;
  onSave: () => void;
};

export type NoticeConfigFormErrors = Partial<
  Record<keyof NoticeConfigFormValues, string>
>;
