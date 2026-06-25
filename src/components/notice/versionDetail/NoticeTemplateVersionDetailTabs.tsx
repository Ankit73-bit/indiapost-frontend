import { Image as ImageIcon, FileType2, Settings2 } from 'lucide-react';
import { NoticeTemplateVersionConfigTab } from '@/components/notice/versionDetail/NoticeTemplateVersionConfigTab';
import { NoticeTemplateVersionImagesTab } from '@/components/notice/versionDetail/NoticeTemplateVersionImagesTab';
import { NoticeTemplateVersionTemplatesTab } from '@/components/notice/versionDetail/NoticeTemplateVersionTemplatesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionDetailTabsProps {
  detailVersion: NoticeTemplateVersion;
  configForm: NoticeConfigFormValues;
  clientId: string;
  typFileNames: string[];
  imageFileNames: string[];
  configErrors: Partial<Record<keyof NoticeConfigFormValues, string>>;
  typFiles: File[];
  imageFiles: File[];
  uploading: boolean;
  savingConfig: boolean;
  onConfigFormChange: (values: NoticeConfigFormValues) => void;
  onSaveConfig: () => void;
  onDuplicateVersion: () => void;
  onTypFilesChange: (files: File[]) => void;
  onImageFilesChange: (files: File[]) => void;
  onUpload: (files: File[]) => void;
}

const TAB_ITEMS = [
  { value: 'config', label: 'Config', icon: Settings2 },
  { value: 'templates', label: 'Templates', icon: FileType2 },
  { value: 'images', label: 'Images', icon: ImageIcon },
] as const;

export function NoticeTemplateVersionDetailTabs({
  detailVersion,
  configForm,
  clientId,
  typFileNames,
  imageFileNames,
  configErrors,
  typFiles,
  imageFiles,
  uploading,
  savingConfig,
  onConfigFormChange,
  onSaveConfig,
  onDuplicateVersion,
  onTypFilesChange,
  onImageFilesChange,
  onUpload,
}: NoticeTemplateVersionDetailTabsProps) {
  return (
    <div className="px-5 pb-6 pt-2">
      <Tabs defaultValue="config">
        <TabsList className="mb-4 h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="config">
          <NoticeTemplateVersionConfigTab
            detailVersion={detailVersion}
            configForm={configForm}
            clientId={clientId}
            configErrors={configErrors}
            savingConfig={savingConfig}
            onConfigFormChange={onConfigFormChange}
            onSaveConfig={onSaveConfig}
            onDuplicateVersion={onDuplicateVersion}
          />
        </TabsContent>

        <TabsContent value="templates">
          <NoticeTemplateVersionTemplatesTab
            detailVersion={detailVersion}
            typFileNames={typFileNames}
            typFiles={typFiles}
            uploading={uploading}
            onTypFilesChange={onTypFilesChange}
            onUpload={onUpload}
            onDuplicateVersion={onDuplicateVersion}
          />
        </TabsContent>

        <TabsContent value="images">
          <NoticeTemplateVersionImagesTab
            detailVersion={detailVersion}
            imageFileNames={imageFileNames}
            imageFiles={imageFiles}
            uploading={uploading}
            onImageFilesChange={onImageFilesChange}
            onUpload={onUpload}
            onDuplicateVersion={onDuplicateVersion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
