import type {
  DateOutputStyle,
  NoticeListFieldConfig,
  NoticeTableConfig,
} from '@/types';
import type { NoticeConfigFormValues } from './noticeConfig.types';

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

export function normalizeTable(
  t: NoticeTableConfig & { max_rows?: number; rotation?: boolean },
): NoticeTableConfig {
  const { max_rows: _mr, rotation: _rot, ...table } = t;
  return {
    ...table,
    columns: table.columns ?? [],
  };
}

export function normalizeListField(
  l: NoticeListFieldConfig & { max_items?: number },
): NoticeListFieldConfig {
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
