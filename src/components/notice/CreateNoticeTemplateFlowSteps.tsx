import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDropZone } from '@/components/notice/FileDropZone';
import type { CreateNoticeTemplateStepId } from '@/components/notice/createNoticeTemplateFlow.constants';

interface CreateNoticeTemplateFlowStepsProps {
  step: CreateNoticeTemplateStepId;
  noticeName: string;
  onNoticeNameChange: (value: string) => void;
  noticeId: string;
  noticeIdTouched: boolean;
  derivedNoticeId: string;
  onNoticeIdChange: (value: string) => void;
  onNoticeIdTouched: () => void;
  typFiles: File[];
  onTypFilesChange: (files: File[]) => void;
  imageFiles: File[];
  onImageFilesChange: (files: File[]) => void;
}

export function CreateNoticeTemplateFlowSteps({
  step,
  noticeName,
  onNoticeNameChange,
  noticeId,
  noticeIdTouched,
  derivedNoticeId,
  onNoticeIdChange,
  onNoticeIdTouched,
  typFiles,
  onTypFilesChange,
  imageFiles,
  onImageFilesChange,
}: CreateNoticeTemplateFlowStepsProps) {
  if (step === 'templates') {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notice-name">Template name</Label>
            <Input
              id="notice-name"
              value={noticeName}
              onChange={(e) => onNoticeNameChange(e.target.value)}
              placeholder="e.g. BHFL Assignment Notice"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notice-id">Notice ID</Label>
            <Input
              id="notice-id"
              value={noticeIdTouched ? noticeId : derivedNoticeId}
              onChange={(e) => {
                onNoticeIdTouched();
                onNoticeIdChange(e.target.value);
              }}
              placeholder="e.g. bhfl_assignment"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Used for storage paths. Auto-generated from the name until you edit it.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Typst templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload one or more <code className="text-xs">.typ</code> files. After
            creation you will set state/language → file mappings on the Template
            Mapping page.
          </p>
        </div>
        <FileDropZone
          accept=".typ"
          acceptLabel=".typ files — include default.typ"
          files={typFiles}
          onFilesChange={onTypFilesChange}
          emptyHint="Add default.typ plus language variants (hindi.typ, marathi.typ, …)."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Template images</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Logos, signatures, and assets referenced in your .typ files.
        </p>
      </div>
      <FileDropZone
        accept=".png,.jpg,.jpeg,.webp,image/*"
        acceptLabel="PNG, JPG, WEBP"
        files={imageFiles}
        onFilesChange={onImageFilesChange}
        icon="image"
      />
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{noticeName}</span>{' '}
            <span className="font-mono text-xs">({derivedNoticeId})</span>
          </p>
          <p>
            {typFiles.length} template(s) · {imageFiles.length} image(s)
          </p>
          <p className="text-xs">
            Next: configure template mapping, then link a config from the Config tab.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
