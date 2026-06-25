import { NoticeTablesListEditors } from '@/components/notice/NoticeTablesListEditors';
import { NoticeConfigClientSelect } from '@/components/notice/config/NoticeConfigClientSelect';
import { NoticeConfigColumnMappingCard } from '@/components/notice/config/NoticeConfigColumnMappingCard';
import { NoticeConfigCoreMappingCard } from '@/components/notice/config/NoticeConfigCoreMappingCard';
import { NoticeConfigOutputDatesCard } from '@/components/notice/config/NoticeConfigOutputDatesCard';
import { NoticeConfigPdfProtectionCard } from '@/components/notice/config/NoticeConfigPdfProtectionCard';
import { NoticeConfigUploadedBanner } from '@/components/notice/config/NoticeConfigUploadedBanner';
import { NoticeConfigVersionNotesField } from '@/components/notice/config/NoticeConfigVersionNotesField';
import type { NoticeConfigFormProps } from '@/components/notice/config/noticeConfigForm.types';
import { DEFAULT_NOTICE_CONFIG_FORM, type NoticeConfigFormValues } from '@/lib/noticeConfig';

export function NoticeConfigForm({
  values,
  onChange,
  clients,
  clientId,
  onClientIdChange,
  isAdmin,
  uploadedFileName,
  errors = {},
  readOnly = false,
  showWithHeader = true,
}: NoticeConfigFormProps) {
  function set<K extends keyof NoticeConfigFormValues>(
    key: K,
    value: NoticeConfigFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      {uploadedFileName && (
        <NoticeConfigUploadedBanner uploadedFileName={uploadedFileName} />
      )}

      {isAdmin && clients && onClientIdChange && (
        <NoticeConfigClientSelect
          clients={clients}
          clientId={clientId}
          readOnly={readOnly}
          onClientIdChange={onClientIdChange}
        />
      )}

      <NoticeConfigCoreMappingCard
        values={values}
        errors={errors}
        readOnly={readOnly}
        showWithHeader={showWithHeader}
        set={set}
      />

      <NoticeConfigOutputDatesCard values={values} readOnly={readOnly} set={set} />

      <NoticeConfigColumnMappingCard values={values} readOnly={readOnly} set={set} />

      <NoticeConfigPdfProtectionCard values={values} readOnly={readOnly} set={set} />

      <NoticeTablesListEditors values={values} onChange={onChange} readOnly={readOnly} />

      {!readOnly && (
        <NoticeConfigVersionNotesField
          value={values.description}
          onChange={(value) => set('description', value)}
        />
      )}
    </div>
  );
}

export { DEFAULT_NOTICE_CONFIG_FORM };
