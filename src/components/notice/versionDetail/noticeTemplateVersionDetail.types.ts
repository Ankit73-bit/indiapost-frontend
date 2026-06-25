import type { NoticeTemplateVersion, VariableValidationResult } from '@/types';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';

export interface NoticeTemplateVersionDetailProps {
  selectedVersion: string;
  detailVersion: NoticeTemplateVersion | undefined;
  configForm: NoticeConfigFormValues | null;
  clientId: string;
  isDefault: boolean;
  canActivate: boolean | undefined;
  typFileNames: string[];
  imageFileNames: string[];
  validation: VariableValidationResult | null;
  configErrors: Partial<Record<keyof NoticeConfigFormValues, string>>;
  typFiles: File[];
  imageFiles: File[];
  creatingVersion: boolean;
  uploading: boolean;
  activating: boolean;
  savingConfig: boolean;
  savingLayout: boolean;
  onConfigFormChange: (values: NoticeConfigFormValues) => void;
  onWithHeaderChange: (withHeader: boolean) => void;
  onSaveConfig: () => void;
  onMarkDefault: () => void;
  onDuplicateVersion: () => void;
  onTypFilesChange: (files: File[]) => void;
  onImageFilesChange: (files: File[]) => void;
  onUpload: (files: File[]) => void;
}
