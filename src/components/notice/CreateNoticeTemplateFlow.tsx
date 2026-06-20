import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  Image as ImageIcon,
  Loader2,
  FileType2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { NoticeStepIndicator } from '@/components/notice/NoticeStepIndicator';
import { NoticeConfigForm } from '@/components/notice/NoticeConfigForm';
import {
  downloadSampleConfigFile,
  emptyNoticeConfigForm,
  formValuesToNoticeConfig,
  parseUploadedConfigFile,
  readJsonFile,
  validateNoticeConfigForm,
} from '@/lib/noticeConfig';
import {
  useCreateNoticeTemplateMutation,
  useUploadNoticeVersionFilesMutation,
} from '@/store/api/noticeTemplatesApi';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import type { Client, NoticeConfig } from '@/types';

const STEPS = [
  { id: 'config', label: 'Configuration', icon: FileJson },
  { id: 'templates', label: 'Templates', icon: FileType2 },
  { id: 'images', label: 'Images', icon: ImageIcon },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface CreateNoticeTemplateFlowProps {
  clientId: string;
  onClientIdChange?: (id: string) => void;
  clients?: Client[];
  isAdmin?: boolean;
}

export function CreateNoticeTemplateFlow({
  clientId,
  onClientIdChange,
  clients,
  isAdmin,
}: CreateNoticeTemplateFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>('config');
  const [configMode, setConfigMode] = useState<'upload' | 'manual' | null>(null);
  const [formValues, setFormValues] = useState(emptyNoticeConfigForm);
  const [uploadedConfigName, setUploadedConfigName] = useState<string | null>(null);
  const [parsedTables, setParsedTables] = useState<NoticeConfig['tables']>();
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [typFiles, setTypFiles] = useState<File[]>([]);
  const [templateJsonFile, setTemplateJsonFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [createTemplate] = useCreateNoticeTemplateMutation();
  const [uploadFiles] = useUploadNoticeVersionFilesMutation();

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/templates?clientId=${clientId}`
      : '/notice-generator/templates';

  async function handleConfigUpload(files: FileList | File[]) {
    const file = files[0];
    if (!file) return;
    try {
      const raw = await readJsonFile(file);
      const { form, tables } = parseUploadedConfigFile(raw);
      setFormValues(form);
      setParsedTables(tables);
      setUploadedConfigName(file.name);
      setConfigMode('upload');

      const slug = raw.client_slug;
      if (isAdmin && onClientIdChange && typeof slug === 'string' && clients) {
        const match = clients.find(
          (c) => c.slug.toLowerCase() === slug.toLowerCase(),
        );
        if (match) onClientIdChange(match._id);
      }

      toast.success('Config loaded — review the fields below');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid config file');
    }
  }

  function goNext() {
    if (step === 'config') {
      const errors = validateNoticeConfigForm(formValues, clientId);
      if (Object.keys(errors).length) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      setStep('templates');
      return;
    }
    if (step === 'templates') {
      if (!typFiles.some((f) => f.name.toLowerCase().endsWith('.typ'))) {
        toast.error('Upload at least one .typ template file');
        return;
      }
      setStep('images');
    }
  }

  function goBack() {
    if (step === 'templates') setStep('config');
    if (step === 'images') setStep('templates');
  }

  async function handleSubmit() {
    const errors = validateNoticeConfigForm(formValues, clientId);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setStep('config');
      return;
    }

    setSubmitting(true);
    try {
      const noticeConfig = formValuesToNoticeConfig(formValues, parsedTables);
      const template = await createTemplate({
        clientId,
        noticeConfig,
        description: formValues.description || undefined,
      }).unwrap();

      const version = template.versions[0]?.version ?? 'v1';
      const allFiles = [
        ...typFiles,
        ...(templateJsonFile ? [templateJsonFile] : []),
        ...imageFiles,
      ];

      if (allFiles.length > 0) {
        await uploadFiles({
          templateId: template._id,
          version,
          files: allFiles,
        }).unwrap();
      }

      toast.success('Notice template created');
      const detailUrl =
        isAdmin && clientId
          ? `/notice-generator/templates/${template._id}?clientId=${clientId}`
          : `/notice-generator/templates/${template._id}`;
      navigate(detailUrl);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create template'));
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <NoticeStepIndicator steps={[...STEPS]} currentIndex={stepIndex} />

      <div className="min-h-[420px]">
        {step === 'config' && (
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Start with a config file</CardTitle>
                <CardDescription>
                  Download the sample JSON with required and optional fields, fill it
                  in, and upload — or build the mapping in the form.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={downloadSampleConfigFile}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download sample config
                </Button>
                <Button
                  type="button"
                  variant={configMode === 'upload' ? 'default' : 'secondary'}
                  className="flex-1"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,application/json';
                    input.onchange = () => {
                      if (input.files) void handleConfigUpload(input.files);
                    };
                    input.click();
                  }}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Upload config JSON
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {configMode === 'upload' ? 'Review uploaded config' : 'Or create manually'}
                </span>
              </div>
            </div>

            {!configMode && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setConfigMode('manual')}
              >
                Fill in the mapping form
              </Button>
            )}

            {(configMode === 'upload' || configMode === 'manual') && (
              <NoticeConfigForm
                values={formValues}
                onChange={setFormValues}
                clients={clients}
                clientId={clientId}
                onClientIdChange={onClientIdChange}
                isAdmin={isAdmin}
                uploadedFileName={uploadedConfigName}
                errors={formErrors}
              />
            )}
          </div>
        )}

        {step === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium">Typst templates</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload one or more <code className="text-xs">.typ</code> files.
              </p>
            </div>
            <FileDropZone
              accept=".typ"
              acceptLabel=".typ files — include default.typ"
              files={typFiles}
              onFilesChange={setTypFiles}
              emptyHint="Add default.typ plus language variants (hindi.typ, marathi.typ, …)."
            />
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium">
                template.json{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                State / language mapping for multi-template notices.
              </p>
              <div className="mt-3">
                <FileDropZone
                  accept=".json"
                  acceptLabel="template.json"
                  files={templateJsonFile ? [templateJsonFile] : []}
                  onFilesChange={(f) => setTemplateJsonFile(f[0] ?? null)}
                  multiple={false}
                />
              </div>
            </div>
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
                  <span className="font-medium text-foreground">
                    {formValues.notice_name || '—'}
                  </span>{' '}
                  ({formValues.notice_id || '—'})
                </p>
                <p>
                  Header: {formValues.with_header ? 'Yes' : 'No'} · ID:{' '}
                  <code className="text-xs">{formValues.id_field}</code>
                </p>
                <p>
                  {typFiles.length} template(s)
                  {templateJsonFile ? ' + template.json' : ''} · {imageFiles.length}{' '}
                  image(s)
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
            step === 'config' ? navigate(listUrl) : goBack()
          }
          disabled={submitting}
        >
          {step === 'config' ? (
            <>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to templates
            </>
          ) : (
            <>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </>
          )}
        </Button>

        {step !== 'images' ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={step === 'config' && !configMode}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create template
          </Button>
        )}
      </div>
    </div>
  );
}
