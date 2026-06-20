import type {
  DateOutputStyle,
  NoticeConfig,
  NoticeListFieldConfig,
  NoticeTableConfig,
  NoticeTableColumnConfig,
} from '@/types';

export interface NoticeConfigFormValues {
  notice_id: string;
  notice_name: string;
  id_field: string;
  with_header: boolean;
  sort_field: string;
  date_output_style: DateOutputStyle;
  additional_fields: string[];
  date_fields: string[];
  decimal_fields: string[];
  tables: NoticeTableConfig[];
  list_fields: NoticeListFieldConfig[];
  description: string;
}

export const DEFAULT_NOTICE_CONFIG_FORM: NoticeConfigFormValues = {
  notice_id: '',
  notice_name: '',
  id_field: 'cuid',
  with_header: false,
  sort_field: 'SrNo',
  date_output_style: 'dd-mm-yyyy',
  additional_fields: [],
  date_fields: [],
  decimal_fields: [],
  tables: [],
  list_fields: [],
  description: '',
};

export function buildSampleConfigDownload(): Record<string, unknown> {
  return {
    _guide: {
      about: 'The _guide section is ignored on upload.',
      required: ['notice_id', 'notice_name', 'id_field', 'with_header'],
      date_output_style: 'dd-mm-yyyy or dd-mmm-yyyy',
    },
    notice_id: 'SAMPLE_NOTICE',
    notice_name: 'Sample Notice Name',
    with_header: false,
    id_field: 'cuid',
    sort_field: 'SrNo',
    date_output_style: 'dd-mm-yyyy',
    additional_fields: ['SrNo', 'customer_name'],
    date_fields: ['notice_date'],
    decimal_fields: ['outstanding_amount'],
    tables: [
      {
        id: 'table1',
        placeholder_pattern: '[{{col_1}}], [{{col_2}}],',
        id_column: 'SrNo',
        max_rows: 20,
        rotation: false,
        columns: [
          { name: 'SrNo', format: 'int' },
          { name: 'branch_name', format: 'str' },
        ],
      },
    ],
    list_fields: [
      {
        field_name: 'loan_account_number',
        placeholder: 'loan_application_nos',
        max_items: 20,
      },
    ],
  };
}

export function downloadSampleConfigFile() {
  const blob = new Blob([JSON.stringify(buildSampleConfigDownload(), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notice-config.sample.json';
  a.click();
  URL.revokeObjectURL(url);
}

function stripGuide(obj: Record<string, unknown>): Record<string, unknown> {
  const { _guide: _, ...rest } = obj;
  return rest;
}

function migrateDateStyle(data: Record<string, unknown>): DateOutputStyle {
  if (data.date_output_style === 'dd-mmm-yyyy') return 'dd-mmm-yyyy';
  if (data.date_output_style === 'dd-mm-yyyy') return 'dd-mm-yyyy';
  return 'dd-mm-yyyy';
}

export function parseUploadedConfigFile(raw: Record<string, unknown>): {
  form: NoticeConfigFormValues;
} {
  const data = stripGuide(raw);
  return {
    form: {
      notice_id: String(data.notice_id ?? ''),
      notice_name: String(data.notice_name ?? ''),
      id_field: String(data.id_field ?? 'cuid'),
      with_header: Boolean(data.with_header),
      sort_field: String(data.sort_field ?? ''),
      date_output_style: migrateDateStyle(data),
      additional_fields: Array.isArray(data.additional_fields)
        ? data.additional_fields.map(String)
        : [],
      date_fields: Array.isArray(data.date_fields)
        ? data.date_fields.map(String)
        : [],
      decimal_fields: Array.isArray(data.decimal_fields)
        ? data.decimal_fields.map(String)
        : [],
      tables: Array.isArray(data.tables)
        ? (data.tables as NoticeTableConfig[]).map(normalizeTable)
        : [],
      list_fields: Array.isArray(data.list_fields)
        ? (data.list_fields as NoticeListFieldConfig[]).map(normalizeListField)
        : [],
      description: String(data.description ?? ''),
    },
  };
}

function normalizeTable(t: NoticeTableConfig): NoticeTableConfig {
  return {
    ...t,
    max_rows: t.max_rows ?? 20,
    columns: t.columns ?? [],
  };
}

function normalizeListField(l: NoticeListFieldConfig): NoticeListFieldConfig {
  return {
    ...l,
    max_items: l.max_items ?? 20,
  };
}

export function formValuesToNoticeConfig(form: NoticeConfigFormValues): NoticeConfig {
  const config: NoticeConfig = {
    notice_id: form.notice_id.trim(),
    notice_name: form.notice_name.trim(),
    with_header: form.with_header,
    id_field: form.id_field.trim(),
    date_output_style: form.date_output_style,
  };
  if (form.sort_field.trim()) config.sort_field = form.sort_field.trim();
  if (form.additional_fields.length) config.additional_fields = form.additional_fields;
  if (form.date_fields.length) config.date_fields = form.date_fields;
  if (form.decimal_fields.length) config.decimal_fields = form.decimal_fields;
  if (form.tables.length) config.tables = form.tables;
  if (form.list_fields.length) config.list_fields = form.list_fields;
  return config;
}

export function noticeConfigToFormValues(
  config: NoticeConfig,
  description = '',
): NoticeConfigFormValues {
  return {
    notice_id: config.notice_id,
    notice_name: config.notice_name,
    id_field: config.id_field,
    with_header: config.with_header ?? false,
    sort_field: config.sort_field ?? '',
    date_output_style: config.date_output_style ?? 'dd-mm-yyyy',
    additional_fields: config.additional_fields ?? [],
    date_fields: config.date_fields ?? [],
    decimal_fields: config.decimal_fields ?? [],
    tables: (config.tables ?? []).map(normalizeTable),
    list_fields: (config.list_fields ?? []).map(normalizeListField),
    description,
  };
}

export function emptyNoticeConfigForm(): NoticeConfigFormValues {
  return { ...DEFAULT_NOTICE_CONFIG_FORM };
}

export function validateNoticeConfigForm(
  values: NoticeConfigFormValues,
  clientId: string,
): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  if (!clientId) errors.clientId = 'Select a client';
  if (!values.notice_id.trim()) errors.notice_id = 'Notice ID is required';
  if (!values.notice_name.trim()) errors.notice_name = 'Notice name is required';
  if (!values.id_field.trim()) errors.id_field = 'ID field is required';
  return errors;
}

export function readJsonFile(file: File): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as Record<string, unknown>);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function emptyTable(id: string): NoticeTableConfig {
  return {
    id,
    placeholder_pattern: '',
    id_column: 'SrNo',
    max_rows: 20,
    rotation: false,
    columns: [{ name: 'SrNo', format: 'str' }],
  };
}

export function emptyListField(): NoticeListFieldConfig {
  return {
    field_name: '',
    placeholder: '',
    max_items: 20,
  };
}

export const COLUMN_FORMATS: NoticeTableColumnConfig['format'][] = [
  'str',
  'int',
  'float',
  'date',
  'time',
];
