import type { NoticeListFieldConfig, NoticeTableConfig } from '@/types';

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
