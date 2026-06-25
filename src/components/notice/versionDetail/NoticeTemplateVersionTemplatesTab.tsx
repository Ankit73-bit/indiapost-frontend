import { Loader2 } from 'lucide-react';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeVersionFileList } from '@/components/notice/NoticeVersionFileList';
import { NoticeVersionDraftUploadRestriction } from '@/components/notice/versionDetail/NoticeVersionDraftUploadRestriction';
import { Button } from '@/components/ui/button';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionTemplatesTabProps {
  detailVersion: NoticeTemplateVersion;
  typFileNames: string[];
  typFiles: File[];
  uploading: boolean;
  onTypFilesChange: (files: File[]) => void;
  onUpload: (files: File[]) => void;
  onDuplicateVersion: () => void;
}

export function NoticeTemplateVersionTemplatesTab({
  detailVersion,
  typFileNames,
  typFiles,
  uploading,
  onTypFilesChange,
  onUpload,
  onDuplicateVersion,
}: NoticeTemplateVersionTemplatesTabProps) {
  return (
    <div className="mt-0 space-y-4">
      {typFileNames.length > 0 && (
        <NoticeVersionFileList title="Uploaded .typ files" files={typFileNames} />
      )}
      {detailVersion.status === 'draft' ? (
        <>
          <p className="text-sm text-muted-foreground">
            Uploading a file with the same name replaces the existing one.
          </p>
          <FileDropZone
            accept=".typ"
            acceptLabel=".typ template files"
            files={typFiles}
            onFilesChange={onTypFilesChange}
          />
          <Button
            disabled={uploading || !typFiles.length}
            onClick={() => void onUpload(typFiles)}
          >
            {uploading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Upload files
          </Button>
        </>
      ) : (
        <NoticeVersionDraftUploadRestriction
          onDuplicateVersion={onDuplicateVersion}
          editLabel="templates"
        />
      )}
    </div>
  );
}
