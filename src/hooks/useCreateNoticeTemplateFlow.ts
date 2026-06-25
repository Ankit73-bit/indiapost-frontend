import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateNoticeTemplateMutation,
  useUploadNoticeVersionFilesMutation,
} from '@/store/api/noticeTemplatesApi';
import { toast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/helpers';
import { slugifyNoticeId } from '@/lib/noticeTemplate';
import {
  CREATE_NOTICE_TEMPLATE_STEPS,
  type CreateNoticeTemplateStepId,
} from '@/components/notice/createNoticeTemplateFlow.constants';

function hasTypFile(files: File[]): boolean {
  return files.some((f) => f.name.toLowerCase().endsWith('.typ'));
}

function noticeGeneratorUrl(
  path: string,
  clientId: string,
  isAdmin: boolean | undefined,
): string {
  return isAdmin && clientId ? `${path}?clientId=${clientId}` : path;
}

interface UseCreateNoticeTemplateFlowOptions {
  clientId: string;
  isAdmin?: boolean;
}

export function useCreateNoticeTemplateFlow({
  clientId,
  isAdmin,
}: UseCreateNoticeTemplateFlowOptions) {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreateNoticeTemplateStepId>('templates');
  const [noticeName, setNoticeName] = useState('');
  const [noticeId, setNoticeId] = useState('');
  const [noticeIdTouched, setNoticeIdTouched] = useState(false);
  const [typFiles, setTypFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [createTemplate] = useCreateNoticeTemplateMutation();
  const [uploadFiles] = useUploadNoticeVersionFilesMutation();

  const listUrl = noticeGeneratorUrl(
    '/notice-generator/templates',
    clientId,
    isAdmin,
  );

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
    if (!hasTypFile(typFiles)) {
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
    if (!hasTypFile(typFiles)) {
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
      navigate(
        noticeGeneratorUrl(
          `/notice-generator/templates/${template._id}/mapping`,
          clientId,
          isAdmin,
        ),
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create template'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (step === 'templates') {
      navigate(listUrl);
      return;
    }
    setStep('templates');
  }

  const stepIndex = CREATE_NOTICE_TEMPLATE_STEPS.findIndex((s) => s.id === step);

  return {
    step,
    noticeName,
    setNoticeName,
    noticeId,
    setNoticeId,
    noticeIdTouched,
    setNoticeIdTouched,
    typFiles,
    setTypFiles,
    imageFiles,
    setImageFiles,
    submitting,
    derivedNoticeId,
    goNext,
    handleSubmit,
    handleBack,
    stepIndex,
  };
}
