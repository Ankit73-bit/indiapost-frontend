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
  description: string;
  rotation: boolean;
  max_rows: number;
  file_name: string[];
  date_input_format: string;
  date_output_style: DateOutputStyle;
  variable_fields: string[];
  date_fields: string[];
  decimal_fields: string[];
  password_field: string;
  default_password: string;
  tables: NoticeTableConfig[];
  list_fields: NoticeListFieldConfig[];
}

export const DEFAULT_NOTICE_CONFIG_FORM: NoticeConfigFormValues = {
  notice_id: '',
  notice_name: '',
  id_field: 'cuid',
  with_header: false,
  sort_field: 'SrNo',
  description: '',
  rotation: false,
  max_rows: 20,
  file_name: [],
  date_input_format: '%Y-%m-%d',
  date_output_style: 'dd-mm-yyyy',
  variable_fields: [],
  date_fields: [],
  decimal_fields: [],
  password_field: '',
  default_password: '',
  tables: [],
  list_fields: [],
};

export function buildSampleConfigDownload(): Record<string, unknown> {
  return {
    _guide: {
      about: 'The _guide section is ignored on upload.',
      required: ['notice_id', 'notice_name', 'id_field', 'max_rows', 'with_header'],
      date_output_style: 'dd-mm-yyyy or dd-mmm-yyyy',
      date_input_format: 'e.g. %Y-%m-%d',
      max_rows: 'Shared limit for table rows and list-field items',
    },
    notice_id: 'SAMPLE_NOTICE',
    notice_name: 'Sample Notice Name',
    with_header: false,
    id_field: 'cuid',
    sort_field: 'SrNo',
    max_rows: 20,
    file_name: ['cuid'],
    date_input_format: '%Y-%m-%d',
    date_output_style: 'dd-mm-yyyy',
    variable_fields: ['SrNo', 'customer_name'],
    date_fields: ['notice_date'],
    decimal_fields: ['outstanding_amount'],
    tables: [
      {
        id: 'table1',
        placeholder_pattern: '[{{col_1}}], [{{col_2}}],',
        id_column: 'SrNo',
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
  if (data.date_output_format === '%d-%m-%Y') return 'dd-mm-yyyy';
  return 'dd-mm-yyyy';
}

function resolveMaxRows(data: Record<string, unknown>): number {
  if (typeof data.max_rows === 'number' && data.max_rows > 0) {
    return data.max_rows;
  }

  const legacyValues: number[] = [];
  if (Array.isArray(data.tables)) {
    for (const table of data.tables as Array<{ max_rows?: number }>) {
      if (table.max_rows) legacyValues.push(table.max_rows);
    }
  }
  if (Array.isArray(data.list_fields)) {
    for (const list of data.list_fields as Array<{ max_items?: number }>) {
      if (list.max_items) legacyValues.push(list.max_items);
    }
  }
  return legacyValues.length ? Math.max(...legacyValues) : 20;
}

function resolveRotation(data: Record<string, unknown>): boolean {
  if (typeof data.rotation === 'boolean') return data.rotation;
  if (!Array.isArray(data.tables)) return false;
  return (data.tables as Array<{ rotation?: boolean }>).some((t) => t.rotation);
}

function normalizeTable(t: NoticeTableConfig & { max_rows?: number; rotation?: boolean }): NoticeTableConfig {
  const { max_rows: _mr, rotation: _rot, ...table } = t;
  return {
    ...table,
    columns: table.columns ?? [],
  };
}

function normalizeListField(l: NoticeListFieldConfig & { max_items?: number }): NoticeListFieldConfig {
  const { max_items: _mi, ...list } = l;
  return list;
}

export function parseUploadedConfigFile(raw: Record<string, unknown>): {
  form: NoticeConfigFormValues;
} {
  const data = stripGuide(raw);
  const variableFields = Array.isArray(data.variable_fields)
    ? data.variable_fields.map(String)
    : Array.isArray(data.additional_fields)
      ? data.additional_fields.map(String)
      : [];

  return {
    form: {
      notice_id: String(data.notice_id ?? ''),
      notice_name: String(data.notice_name ?? ''),
      id_field: String(data.id_field ?? 'cuid'),
      with_header: Boolean(data.with_header),
      sort_field: String(data.sort_field ?? ''),
      description: String(data.description ?? ''),
      rotation: resolveRotation(data),
      max_rows: resolveMaxRows(data),
      file_name: Array.isArray(data.file_name) ? data.file_name.map(String) : [],
      date_input_format: String(data.date_input_format ?? '%Y-%m-%d'),
      date_output_style: migrateDateStyle(data),
      variable_fields: variableFields,
      date_fields: Array.isArray(data.date_fields)
        ? data.date_fields.map(String)
        : [],
      decimal_fields: Array.isArray(data.decimal_fields)
        ? data.decimal_fields.map(String)
        : [],
      password_field: String(data.password_field ?? ''),
      default_password: String(data.default_password ?? ''),
      tables: Array.isArray(data.tables)
        ? (data.tables as NoticeTableConfig[]).map(normalizeTable)
        : [],
      list_fields: Array.isArray(data.list_fields)
        ? (data.list_fields as NoticeListFieldConfig[]).map(normalizeListField)
        : [],
    },
  };
}

export function formValuesToNoticeConfig(form: NoticeConfigFormValues): NoticeConfig {
  const config: NoticeConfig = {
    notice_id: form.notice_id.trim(),
    notice_name: form.notice_name.trim(),
    with_header: form.with_header,
    id_field: form.id_field.trim(),
    max_rows: form.max_rows,
    date_output_style: form.date_output_style,
  };
  if (form.sort_field.trim()) config.sort_field = form.sort_field.trim();
  if (form.description.trim()) config.description = form.description.trim();
  if (form.rotation) config.rotation = true;
  if (form.file_name.length) config.file_name = form.file_name;
  if (form.date_input_format.trim()) {
    config.date_input_format = form.date_input_format.trim();
  }
  if (form.variable_fields.length) config.variable_fields = form.variable_fields;
  if (form.date_fields.length) config.date_fields = form.date_fields;
  if (form.decimal_fields.length) config.decimal_fields = form.decimal_fields;
  if (form.password_field.trim()) config.password_field = form.password_field.trim();
  if (form.default_password.trim()) config.default_password = form.default_password.trim();
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
    description: config.description ?? description,
    rotation: config.rotation ?? false,
    max_rows: config.max_rows ?? 20,
    file_name: config.file_name ?? [],
    date_input_format: config.date_input_format ?? '%Y-%m-%d',
    date_output_style: config.date_output_style ?? 'dd-mm-yyyy',
    variable_fields: config.variable_fields ?? [],
    date_fields: config.date_fields ?? [],
    decimal_fields: config.decimal_fields ?? [],
    password_field: config.password_field ?? '',
    default_password: config.default_password ?? '',
    tables: (config.tables ?? []).map(normalizeTable),
    list_fields: (config.list_fields ?? []).map(normalizeListField),
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
  if (!values.max_rows || values.max_rows < 1) {
    errors.max_rows = 'Max rows must be at least 1';
  }
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
    columns: [{ name: 'SrNo', format: 'str' }],
  };
}

export function emptyListField(): NoticeListFieldConfig {
  return {
    field_name: '',
    placeholder: '',
  };
}

export const COLUMN_FORMATS: NoticeTableColumnConfig['format'][] = [
  'str',
  'int',
  'float',
  'date',
  'time',
];
