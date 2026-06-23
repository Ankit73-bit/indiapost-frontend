import type { NoticeConfig } from '@/types';

export interface VariableValidationResult {
  detected: string[];
  configured: string[];
  matched: string[];
  missingInConfig: string[];
  unusedInConfig: string[];
  isValid: boolean;
}

export function collectConfiguredVariables(config: NoticeConfig): string[] {
  const set = new Set<string>();
  if (config.id_field) set.add(config.id_field);
  if (config.sort_field) set.add(config.sort_field);
  for (const f of config.variable_fields ?? []) set.add(f);
  for (const f of config.file_name ?? []) set.add(f);
  for (const f of config.date_fields ?? []) set.add(f);
  for (const f of config.decimal_fields ?? []) set.add(f);
  for (const list of config.list_fields ?? []) {
    if (list.placeholder) set.add(list.placeholder);
  }
  for (const table of config.tables ?? []) {
    if (table.placeholder_pattern) {
      for (const m of table.placeholder_pattern.matchAll(/\{\{([^}]+)\}\}/g)) {
        const key = m[1]?.replace(/\s+/g, '') ?? '';
        if (key) set.add(key);
      }
    }
    if (table.id_column) set.add(table.id_column);
    for (const col of table.columns ?? []) {
      if (col.name) set.add(col.name);
    }
  }
  return [...set].sort();
}

export function validateVariablesAgainstConfig(
  config: NoticeConfig,
  detectedVariables: string[],
): VariableValidationResult {
  const configured = collectConfiguredVariables(config);
  const configuredSet = new Set(configured);
  const detectedSet = new Set(detectedVariables);
  return {
    detected: detectedVariables,
    configured,
    matched: detectedVariables.filter((v) => configuredSet.has(v)),
    missingInConfig: detectedVariables.filter((v) => !configuredSet.has(v)),
    unusedInConfig: configured.filter((v) => !detectedSet.has(v)),
    isValid: detectedVariables.filter((v) => !configuredSet.has(v)).length === 0,
  };
}
