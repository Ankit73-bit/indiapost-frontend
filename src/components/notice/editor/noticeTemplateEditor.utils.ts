import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';

export const IMAGE_FILE_RE = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

export function pickVersion(
  template: NoticeTemplate,
  versionParam: string | null,
): NoticeTemplateVersion {
  if (versionParam) {
    const found = template.versions.find((v) => v.version === versionParam);
    if (found) return found;
  }
  const draft = template.versions.find((v) => v.status === 'draft');
  if (draft) return draft;
  const active = template.versions.find((v) => v.version === template.activeVersion);
  if (active) return active;
  return template.versions[0]!;
}

export function isVersionReadOnly(version: NoticeTemplateVersion): boolean {
  return version.status === 'active';
}
