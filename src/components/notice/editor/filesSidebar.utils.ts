import type { NoticeTemplateVersion } from '@/types';
import { editorFilePath } from './editorUtils';
import type { EditorFileNode } from './filesSidebar.types';

export function buildFileTree(version: NoticeTemplateVersion): EditorFileNode[] {
  const typFiles = version.fileNames.filter((f) => f.endsWith('.typ'));
  const imageFiles = version.fileNames.filter(
    (f) => !f.endsWith('.typ') && !f.endsWith('.json'),
  );

  const tree: EditorFileNode[] = typFiles.map((name) => ({
    name,
    path: editorFilePath(name),
    type: 'file' as const,
  }));

  if (imageFiles.length) {
    tree.push({
      name: 'assets',
      path: 'assets',
      type: 'folder',
      children: imageFiles.map((name) => ({
        name,
        path: editorFilePath(name),
        type: 'file' as const,
      })),
    });
  }

  if (!tree.length) {
    tree.push({ name: 'default.typ', path: 'default.typ', type: 'file' });
  }

  return tree;
}

export function getDefaultFilePath(version: NoticeTemplateVersion): string {
  const typ = version.fileNames.find((f) => f.endsWith('.typ'));
  return typ ? editorFilePath(typ) : 'default.typ';
}

export function flattenTypFiles(version: NoticeTemplateVersion): string[] {
  const typFiles = version.fileNames
    .filter((f) => f.endsWith('.typ'))
    .map(editorFilePath);
  return typFiles.length ? typFiles : ['default.typ'];
}

export function flattenImageFiles(version: NoticeTemplateVersion): string[] {
  return version.fileNames
    .filter((f) => !f.endsWith('.typ') && !f.endsWith('.json'))
    .map(editorFilePath);
}
