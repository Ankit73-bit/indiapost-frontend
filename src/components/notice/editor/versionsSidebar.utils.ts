import type { NoticeTemplateVersion } from '@/types';
import { formatDate } from '@/lib/helpers';

export function sortVersionsDesc(
  versions: NoticeTemplateVersion[],
): NoticeTemplateVersion[] {
  return [...versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );
}

export function versionHasTypFiles(version: NoticeTemplateVersion): boolean {
  return version.fileNames.some((f) => f.toLowerCase().endsWith('.typ'));
}

export function versionLabel(version: NoticeTemplateVersion): string {
  const desc = version.metadata?.description?.trim();
  if (desc) return `${version.version} — ${desc}`;
  return version.version;
}

export function versionMeta(version: NoticeTemplateVersion, isDefault: boolean): string {
  if (version.status === 'active' && isDefault) return 'Active · default';
  if (version.status === 'draft') return 'Draft';
  if (version.status === 'inactive') return 'Inactive';
  return formatDate(version.updatedAt);
}
