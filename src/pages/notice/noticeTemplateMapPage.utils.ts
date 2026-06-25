import type { NoticeTemplateForMap } from '@/pages/notice/noticeTemplateMapPage.types';

export function pickDefaultVersion(
  template: NoticeTemplateForMap,
  versionParam: string | null,
): string {
  if (versionParam && template.versions.some((v) => v.version === versionParam)) {
    return versionParam;
  }
  const draft = template.versions.find((v) => v.status === 'draft');
  if (draft) return draft.version;
  if (template.activeVersion) return template.activeVersion;
  return template.versions[template.versions.length - 1]?.version ?? 'v1';
}
