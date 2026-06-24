import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  FileType2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeStepIndicator } from '@/components/notice/NoticeStepIndicator';
import {
  useCreateNoticeTemplateMutation,
  useUploadNoticeVersionFilesMutation,
} from '@/store/api/noticeTemplatesApi';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';

const STEPS = [
  { id: 'templates', label: 'Templates', icon: FileType2 },
  { id: 'images', label: 'Images', icon: ImageIcon },
] as const;

type StepId = (typeof STEPS)[number]['id'];

function slugifyNoticeId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

interface CreateNoticeTemplateFlowProps {
  clientId: string;
  isAdmin?: boolean;
}

export function CreateNoticeTemplateFlow({
  clientId,
  isAdmin,
}: CreateNoticeTemplateFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>('templates');
  const [noticeName, setNoticeName] = useState('');
  const [noticeId, setNoticeId] = useState('');
  const [noticeIdTouched, setNoticeIdTouched] = useState(false);
  const [typFiles, setTypFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [createTemplate] = useCreateNoticeTemplateMutation();
  const [uploadFiles] = useUploadNoticeVersionFilesMutation();

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  const derivedNoticeId = useMemo(() => {
    if (noticeIdTouched && noticeId.trim()) return noticeId.trim();
    return slugifyNoticeId(noticeName) || '';
  }, [noticeId, noticeIdTouched, noticeName]);

  function goNext() {
    if (!noticeName.trim()) {
      toast.error('Enter a template name');
      return;
    }
    if (!derivedNoticeId) {
      toast.error('Enter a notice ID');
      return;
    }
    if (!typFiles.some((f) => f.name.toLowerCase().endsWith('.typ'))) {
      toast.error('Upload at least one .typ template file');
      return;
    }
    setStep('images');
  }

  async function handleSubmit() {
    const name = noticeName.trim();
    const id = derivedNoticeId;
    if (!name || !id) {
      toast.error('Template name and notice ID are required');
      setStep('templates');
      return;
    }
    if (!typFiles.some((f) => f.name.toLowerCase().endsWith('.typ'))) {
      toast.error('Upload at least one .typ template file');
      setStep('templates');
      return;
    }

    setSubmitting(true);
    try {
      const template = await createTemplate({
        clientId,
        noticeName: name,
        noticeId: id,
      }).unwrap();

      const version = template.versions[0]?.version ?? 'v1';
      const allFiles = [...typFiles, ...imageFiles];

      if (allFiles.length > 0) {
        await uploadFiles({
          templateId: template._id,
          version,
          files: allFiles,
        }).unwrap();
      }

      toast.success('Template created — configure mapping and link a config next');
      const mappingUrl =
        isAdmin && clientId
          ? `/notice-generator/templates/${template._id}/mapping?clientId=${clientId}`
          : `/notice-generator/templates/${template._id}/mapping`;
      navigate(mappingUrl);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create template'));
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="flex w-full flex-col gap-6">
      <NoticeStepIndicator steps={[...STEPS]} currentIndex={stepIndex} />

      <div className="min-h-[420px]">
        {step === 'templates' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="notice-name">Template name</Label>
                <Input
                  id="notice-name"
                  value={noticeName}
                  onChange={(e) => setNoticeName(e.target.value)}
                  placeholder="e.g. BHFL Assignment Notice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notice-id">Notice ID</Label>
                <Input
                  id="notice-id"
                  value={noticeIdTouched ? noticeId : derivedNoticeId}
                  onChange={(e) => {
                    setNoticeIdTouched(true);
                    setNoticeId(e.target.value);
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
              onFilesChange={setTypFiles}
              emptyHint="Add default.typ plus language variants (hindi.typ, marathi.typ, …)."
            />
          </div>
        )}

        {step === 'images' && (
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
              onFilesChange={setImageFiles}
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
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            step === 'templates' ? navigate(listUrl) : setStep('templates')
          }
          disabled={submitting}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {step === 'templates' ? 'Back to templates' : 'Back'}
        </Button>

        {step !== 'images' ? (
          <Button type="button" onClick={goNext}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create template
          </Button>
        )}
      </div>
    </div>
  );
}
