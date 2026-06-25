import { Loader2, Save } from 'lucide-react';
import { NoticeConfigForm } from '@/components/notice/NoticeConfigForm';
import { Button } from '@/components/ui/button';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionConfigTabProps {
  detailVersion: NoticeTemplateVersion;
  configForm: NoticeConfigFormValues;
  clientId: string;
  configErrors: Partial<Record<keyof NoticeConfigFormValues, string>>;
  savingConfig: boolean;
  onConfigFormChange: (values: NoticeConfigFormValues) => void;
  onSaveConfig: () => void;
  onDuplicateVersion: () => void;
}

export function NoticeTemplateVersionConfigTab({
  detailVersion,
  configForm,
  clientId,
  configErrors,
  savingConfig,
  onConfigFormChange,
  onSaveConfig,
  onDuplicateVersion,
}: NoticeTemplateVersionConfigTabProps) {
  return (
    <div className="mt-0 space-y-4">
      {detailVersion.status !== 'draft' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          This version is <strong>{detailVersion.status}</strong>. Config edits apply immediately —{' '}
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => void onDuplicateVersion()}
          >
            duplicate first
          </button>{' '}
          if you want to keep a snapshot.
        </div>
      )}
      <NoticeConfigForm
        values={configForm}
        onChange={onConfigFormChange}
        clientId={clientId}
        errors={configErrors}
        showWithHeader={false}
      />
      <div className="flex justify-end pt-2">
        <Button onClick={() => void onSaveConfig()} disabled={savingConfig}>
          {savingConfig ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save configuration
        </Button>
      </div>
    </div>
  );
}
