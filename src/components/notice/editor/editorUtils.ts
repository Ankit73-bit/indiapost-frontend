export const DEFAULT_CONFIG_FILE_NAME = 'sample.json';

const JSON_REF_RE = /json\("([^"]+\.json)"\)/g;

export function storageFileName(editorPath: string): string {
  return editorPath.replace(/^assets\//, '');
}

export function editorFilePath(storageName: string): string {
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(storageName)) {
    return `assets/${storageName}`;
  }
  return storageName;
}

export function extractTypstJsonReferences(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(JSON_REF_RE)) {
    const name = match[1]?.trim() ?? '';
    if (name) found.add(name);
  }
  return [...found];
}

export function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}
