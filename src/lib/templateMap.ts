export function parseTemplateMapJson(raw: string): Record<string, string> {
  const data = JSON.parse(raw) as { template_dict?: Record<string, string> };
  if (!data.template_dict || typeof data.template_dict !== 'object') {
    throw new Error('template.json must contain a template_dict object');
  }
  return normalizeTemplateMap(data.template_dict);
}

export function normalizeTemplateMap(
  mappings: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(mappings)) {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    if (!trimmedKey || !trimmedValue) continue;
    out[trimmedKey] = trimmedValue;
  }
  return out;
}

export function buildTemplateMapJson(mappings: Record<string, string>): string {
  return JSON.stringify({ template_dict: normalizeTemplateMap(mappings) }, null, 2);
}

export interface TemplateMapEntry {
  id: string;
  key: string;
  value: string;
}

export function entriesFromMap(mappings: Record<string, string>): TemplateMapEntry[] {
  return Object.entries(mappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      id: `${key}::${value}`,
      key,
      value,
    }));
}

export function mapFromEntries(entries: TemplateMapEntry[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of entries) {
    const key = entry.key.trim();
    const value = entry.value.trim();
    if (!key || !value) continue;
    out[key] = value;
  }
  return out;
}

export function createEmptyEntry(): TemplateMapEntry {
  return { id: crypto.randomUUID(), key: '', value: '' };
}
