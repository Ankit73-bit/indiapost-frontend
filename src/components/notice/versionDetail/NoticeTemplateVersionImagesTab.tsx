import { Loader2 } from 'lucide-react';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeVersionFileList } from '@/components/notice/NoticeVersionFileList';
import { NoticeVersionDraftUploadRestriction } from '@/components/notice/versionDetail/NoticeVersionDraftUploadRestriction';
import { Button } from '@/components/ui/button';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionImagesTabProps {
  detailVersion: NoticeTemplateVersion;
  imageFileNames: string[];
  imageFiles: File[];
  uploading: boolean;
  onImageFilesChange: (files: File[]) => void;
  onUpload: (files: File[]) => void;
  onDuplicateVersion: () => void;
}

export function NoticeTemplateVersionImagesTab({
  detailVersion,
  imageFileNames,
  imageFiles,
  uploading,
  onImageFilesChange,
  onUpload,
  onDuplicateVersion,
}: NoticeTemplateVersionImagesTabProps) {
  return (
    <div className="mt-0 space-y-4">
      {imageFileNames.length > 0 && (
        <NoticeVersionFileList title="Uploaded images" files={imageFileNames} />
      )}
      {detailVersion.status === 'draft' ? (
        <>
          <p className="text-sm text-muted-foreground">
            Logos, signatures, and assets referenced by your .typ files.
            Uploading the same name replaces the existing file.
          </p>
          <FileDropZone
            accept=".png,.jpg,.jpeg,.webp,image/*"
            acceptLabel="PNG, JPG, WEBP"
            files={imageFiles}
            onFilesChange={onImageFilesChange}
            icon="image"
          />
          <Button
            disabled={uploading || !imageFiles.length}
            onClick={() => void onUpload(imageFiles)}
          >
            {uploading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Upload images
          </Button>
        </>
      ) : (
        <NoticeVersionDraftUploadRestriction
          onDuplicateVersion={onDuplicateVersion}
          editLabel="images"
        />
      )}
    </div>
  );
}
