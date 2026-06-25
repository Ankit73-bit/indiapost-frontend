import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoticeStepIndicator } from '@/components/notice/NoticeStepIndicator';
import { CREATE_NOTICE_TEMPLATE_STEPS } from '@/components/notice/createNoticeTemplateFlow.constants';
import { CreateNoticeTemplateFlowSteps } from '@/components/notice/CreateNoticeTemplateFlowSteps';
import { useCreateNoticeTemplateFlow } from '@/hooks/useCreateNoticeTemplateFlow';

interface CreateNoticeTemplateFlowProps {
  clientId: string;
  isAdmin?: boolean;
}

export function CreateNoticeTemplateFlow({
  clientId,
  isAdmin,
}: CreateNoticeTemplateFlowProps) {
  const {
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
  } = useCreateNoticeTemplateFlow({ clientId, isAdmin });

  return (
    <div className="flex w-full flex-col gap-6">
      <NoticeStepIndicator
        steps={[...CREATE_NOTICE_TEMPLATE_STEPS]}
        currentIndex={stepIndex}
      />

      <div className="min-h-[420px]">
        <CreateNoticeTemplateFlowSteps
          step={step}
          noticeName={noticeName}
          onNoticeNameChange={setNoticeName}
          noticeId={noticeId}
          noticeIdTouched={noticeIdTouched}
          derivedNoticeId={derivedNoticeId}
          onNoticeIdChange={setNoticeId}
          onNoticeIdTouched={() => setNoticeIdTouched(true)}
          typFiles={typFiles}
          onTypFilesChange={setTypFiles}
          imageFiles={imageFiles}
          onImageFilesChange={setImageFiles}
        />
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
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
