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

/** Excel row field names from table definitions — not template placeholders. */
export function collectTableDataFieldNames(config: NoticeConfig): Set<string> {
  const names = new Set<string>();
  for (const table of config.tables ?? []) {
    if (table.id_column) names.add(table.id_column);
    for (const column of table.columns ?? []) {
      if (column.name) names.add(column.name);
    }
  }
  return names;
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

function isTablePlaceholderToken(varName: string, config: NoticeConfig): boolean {
  return (config.tables ?? []).some((table) =>
    extractPlaceholderTokens(table.placeholder_pattern).includes(varName),
  );
}

/** Scalar + list placeholder names expected directly in templates. */
export function collectScalarConfiguredVariables(config: NoticeConfig): string[] {
  const tableDataFields = collectTableDataFieldNames(config);
  const set = new Set<string>();

  const add = (name?: string) => {
    if (name && !tableDataFields.has(name)) set.add(name);
  };

  add(config.id_field);
  add(config.sort_field);
  add(config.password_field);

  for (const field of config.variable_fields ?? []) add(field);
  for (const field of config.file_name ?? []) add(field);
  for (const field of config.date_fields ?? []) add(field);
  for (const field of config.decimal_fields ?? []) add(field);

  for (const list of config.list_fields ?? []) {
    add(list.placeholder);
  }

  for (const table of config.tables ?? []) {
    add(table.row_count_field);
  }

  return [...set].sort();
}

/** All configured names (includes table placeholder tokens for matching). */
export function collectConfiguredVariables(config: NoticeConfig): string[] {
  const set = new Set(collectScalarConfiguredVariables(config));

  for (const table of config.tables ?? []) {
    for (const token of extractPlaceholderTokens(table.placeholder_pattern)) {
      set.add(token);
    }
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

function isUnusedScalarConfigVariable(
  varName: string,
  detectedSet: Set<string>,
  config: NoticeConfig,
): boolean {
  if (collectTableDataFieldNames(config).has(varName)) return false;
  if (isTablePlaceholderToken(varName, config)) return false;
  if ((config.tables ?? []).some((table) => variableMatchesTable(varName, table))) {
    return false;
  }
  return !detectedSet.has(varName);
}

export function validateVariablesAgainstConfig(
  config: NoticeConfig,
  detectedVariables: string[],
): VariableValidationResult {
  const configured = collectConfiguredVariables(config);
  const scalarConfigured = collectScalarConfiguredVariables(config);
  const detectedSet = new Set(detectedVariables);

  const matched = detectedVariables.filter((variable) =>
    isVariableConfigured(variable, config),
  );
  const missingInConfig = detectedVariables.filter(
    (variable) => !isVariableConfigured(variable, config),
  );
  const unusedInConfig = scalarConfigured.filter((variable) =>
    isUnusedScalarConfigVariable(variable, detectedSet, config),
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
