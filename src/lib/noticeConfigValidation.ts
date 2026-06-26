import type { NoticeConfig, NoticeTableConfig } from '@/types';

export interface VariableValidationResult {
  detected: string[];
  configured: string[];
  matched: string[];
  missingInConfig: string[];
  unusedInConfig: string[];
  isValid: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractPlaceholderTokens(pattern: string): string[] {
  return [...pattern.matchAll(/\{\{([^}]+)\}\}/g)]
    .map((match) => (match[1] ?? '').replace(/\s+/g, ''))
    .filter(Boolean);
}

export function variableMatchesTable(
  varName: string,
  table: NoticeTableConfig,
): boolean {
  const tokens = extractPlaceholderTokens(table.placeholder_pattern);
  if (tokens.includes(varName)) return true;
  if (tokens.length === 0) return false;

  const parsed = tokens.map((token) => {
    const match = /^(.+?)_(\d+)$/.exec(token);
    return match
      ? { prefix: `${match[1]}_`, index: Number.parseInt(match[2]!, 10) }
      : null;
  });

  if (parsed.some((entry) => entry === null)) return false;

  const prefixes = new Set(parsed.map((entry) => entry!.prefix));
  if (prefixes.size !== 1) return false;

  const prefix = [...prefixes][0]!;
  const match = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`).exec(varName);
  if (!match) return false;

  const columnIndex = Number.parseInt(match[1]!, 10);
  const expectedCount = table.columns?.length ?? tokens.length;
  return columnIndex >= 1 && columnIndex <= expectedCount;
}

/** Collect scalar + list placeholder names expected in templates (excludes table column data fields). */
export function collectConfiguredVariables(config: NoticeConfig): string[] {
  const set = new Set<string>();
  if (config.id_field) set.add(config.id_field);
  if (config.sort_field) set.add(config.sort_field);
  if (config.password_field) set.add(config.password_field);

  for (const field of config.variable_fields ?? []) set.add(field);
  for (const field of config.file_name ?? []) set.add(field);
  for (const field of config.date_fields ?? []) set.add(field);
  for (const field of config.decimal_fields ?? []) set.add(field);

  for (const list of config.list_fields ?? []) {
    if (list.placeholder) set.add(list.placeholder);
  }

  for (const table of config.tables ?? []) {
    for (const token of extractPlaceholderTokens(table.placeholder_pattern)) {
      set.add(token);
    }
    if (table.row_count_field) set.add(table.row_count_field);
  }

  return [...set].sort();
}

export function isVariableConfigured(
  varName: string,
  config: NoticeConfig,
): boolean {
  if (collectConfiguredVariables(config).includes(varName)) return true;
  return (config.tables ?? []).some((table) => variableMatchesTable(varName, table));
}

function isConfiguredVariableUsedInTemplate(
  varName: string,
  detectedSet: Set<string>,
  config: NoticeConfig,
): boolean {
  if (detectedSet.has(varName)) return true;

  for (const table of config.tables ?? []) {
    const tokens = extractPlaceholderTokens(table.placeholder_pattern);
    if (!tokens.includes(varName)) continue;
    return [...detectedSet].some((detected) =>
      variableMatchesTable(detected, table),
    );
  }

  return false;
}

export function validateVariablesAgainstConfig(
  config: NoticeConfig,
  detectedVariables: string[],
): VariableValidationResult {
  const configured = collectConfiguredVariables(config);
  const detectedSet = new Set(detectedVariables);

  const matched = detectedVariables.filter((variable) =>
    isVariableConfigured(variable, config),
  );
  const missingInConfig = detectedVariables.filter(
    (variable) => !isVariableConfigured(variable, config),
  );
  const unusedInConfig = configured.filter(
    (variable) =>
      !isConfiguredVariableUsedInTemplate(variable, detectedSet, config),
  );

  return {
    detected: detectedVariables,
    configured,
    matched,
    missingInConfig,
    unusedInConfig,
    isValid: missingInConfig.length === 0,
  };
}
