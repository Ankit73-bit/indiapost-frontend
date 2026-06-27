import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { NoticeTypeCombobox } from '@/components/shared/NoticeTypeCombobox';
import { ListFormDialogClientSection } from '@/components/lists/ListFormDialogClientSection';
import { ListFormDialogSlugPreview } from '@/components/lists/ListFormDialogSlugPreview';
import { NoticeExcelDropZone } from '@/components/notice/excel/NoticeExcelDropZone';
import { SampleExcelValidationReport } from '@/components/notice/sampleExcel/SampleExcelValidationReport';
import type { NoticeExcelFormValues } from '@/pages/notice/noticeExcelForm.schema';
import type { Client, NoticeExcelRecord, SampleExcelValidationResult } from '@/types';
import type { ListFormValues } from '@/pages/lists/listsPage.types';
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

interface NoticeExcelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replacing: NoticeExcelRecord | null;
  isAdmin: boolean;
  activeClients: Client[];
  customerClient: Client | undefined;
  authClientId: string | undefined;
  watchedClientId: string;
  watchedNoticeType: string;
  formClientId: string;
  formNoticeTypesData: string[] | undefined;
  generatedSlugPreview: string | null;
  excelFile: File | null;
  onExcelFile: (file: File | null) => void;
  validation: SampleExcelValidationResult | null;
  validating: boolean;
  submitError: string;
  submitting: boolean;
  register: UseFormRegister<NoticeExcelFormValues>;
  handleSubmit: UseFormHandleSubmit<NoticeExcelFormValues>;
  setValue: UseFormSetValue<NoticeExcelFormValues>;
  errors: FieldErrors<NoticeExcelFormValues>;
  onSubmit: (values: NoticeExcelFormValues) => void;
}

export function NoticeExcelFormDialog({
  open,
  onOpenChange,
  replacing,
  isAdmin,
  activeClients,
  customerClient,
  authClientId,
  watchedClientId,
  watchedNoticeType,
  formClientId,
  formNoticeTypesData,
  generatedSlugPreview,
  excelFile,
  onExcelFile,
  validation,
  validating,
  submitError,
  submitting,
  register,
  handleSubmit,
  setValue,
  errors,
  onSubmit,
}: NoticeExcelFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {replacing ? 'Replace Excel' : 'Create Excel'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!replacing && (
            <>
              <ListFormDialogClientSection
                editing={null}
                isAdmin={isAdmin}
                activeClients={activeClients}
                customerClient={customerClient}
                authClientId={authClientId}
                watchedClientId={watchedClientId}
                setValue={setValue as unknown as UseFormSetValue<ListFormValues>}
                errors={errors}
              />
              <NoticeTypeCombobox
                value={watchedNoticeType ?? ''}
                onChange={(v) => setValue('noticeType', v, { shouldValidate: true })}
                knownTypes={formNoticeTypesData}
                clientScoped
                error={errors.noticeType?.message}
                disabled={!formClientId}
              />
              <div className="space-y-1.5">
                <Label>
                  Notice Name <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="e.g. aug-demand-batch" {...register('noticeName')} />
                {errors.noticeName && (
                  <p className="text-xs text-destructive">{errors.noticeName.message}</p>
                )}
              </div>
              <ListFormDialogSlugPreview
                editing={null}
                generatedSlugPreview={generatedSlugPreview}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Notice Date <span className="text-destructive">*</span>
                  </Label>
                  <Input type="date" {...register('noticeDate')} />
                  {errors.noticeDate && (
                    <p className="text-xs text-destructive">{errors.noticeDate.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Dispatch Date{' '}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input type="date" {...register('dispatchDate')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Optional notes" {...register('description')} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>
              Upload Excel <span className="text-destructive">*</span>
            </Label>
            <NoticeExcelDropZone
              file={excelFile}
              onFile={(file) => onExcelFile(file)}
              onClear={() => onExcelFile(null)}
            />
          </div>

          {validation && <SampleExcelValidationReport validation={validation} />}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || validating || !excelFile}>
              {(submitting || validating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {replacing ? 'Replace Excel' : 'Create Excel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
