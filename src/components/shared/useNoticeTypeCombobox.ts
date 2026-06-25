import { useEffect, useMemo, useState } from 'react';
import { mergeNoticeTypes } from '@/lib/listNaming';
import { CUSTOM_NOTICE_TYPE_OPTION } from '@/components/shared/noticeTypeCombobox.constants';
import type { NoticeTypeComboboxProps } from '@/components/shared/noticeTypeCombobox.types';

export function useNoticeTypeCombobox({
  value,
  onChange,
  knownTypes = [],
  clientScoped = false,
}: Pick<
  NoticeTypeComboboxProps,
  'value' | 'onChange' | 'knownTypes' | 'clientScoped'
>) {
  const options = useMemo(() => {
    if (clientScoped) {
      return [...new Set(knownTypes.map((t) => t.trim().toUpperCase()).filter(Boolean))].sort();
    }
    return mergeNoticeTypes(knownTypes);
  }, [knownTypes, clientScoped]);

  const normalizedValue = value.trim().toUpperCase();
  const valueInOptions = normalizedValue
    ? options.includes(normalizedValue)
    : false;
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (!normalizedValue) {
      setCustomMode(false);
      return;
    }
    setCustomMode(!valueInOptions);
  }, [normalizedValue, valueInOptions]);

  const selectValue = customMode
    ? CUSTOM_NOTICE_TYPE_OPTION
    : value && valueInOptions
      ? value.toUpperCase()
      : undefined;

  function handleSelectChange(v: string) {
    if (v === CUSTOM_NOTICE_TYPE_OPTION) {
      setCustomMode(true);
      if (valueInOptions) onChange('');
      return;
    }
    setCustomMode(false);
    onChange(v);
  }

  const helpContent = clientScoped
    ? options.length > 0
      ? 'Types previously used for this client, or add a new custom type.'
      : 'No notice types yet for this client — add a custom type below.'
    : 'Pick a preset or add a custom type — new types appear in filters after save.';

  return {
    options,
    customMode,
    selectValue,
    handleSelectChange,
    helpContent,
  };
}
