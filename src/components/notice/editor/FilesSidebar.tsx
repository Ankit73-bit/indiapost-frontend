import { useRef } from 'react';
import {
  ChevronRight,
  File,
  FilePlus2,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NoticeTemplate, NoticeTemplateVersion } from '@/types';
import { editorFilePath } from './editorUtils';

export interface EditorFileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: EditorFileNode[];
}

function buildFileTree(version: NoticeTemplateVersion): EditorFileNode[] {
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

interface FilesSidebarProps {
  template: NoticeTemplate;
  version: NoticeTemplateVersion;
  activeFile: string;
  expandedFolders: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onUploadFiles?: (files: FileList) => void;
  isUploading?: boolean;
  readOnly?: boolean;
}

export function FilesSidebar({
  template,
  version,
  activeFile,
  expandedFolders,
  onSelectFile,
  onToggleFolder,
  onUploadFiles,
  isUploading,
  readOnly,
}: FilesSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tree = buildFileTree(version);

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <p className="text-sm font-medium text-foreground">Files</p>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="h-7 w-7"
          disabled={readOnly || isUploading || !onUploadFiles}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FilePlus2 className="h-4 w-4" />
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".typ,.png,.jpg,.jpeg,.webp,.gif,.svg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length && onUploadFiles) {
              onUploadFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted/60"
        >
          <FolderOpen className="h-3.5 w-3.5 text-primary" />
          {template.noticeName}
        </button>

        <div className="space-y-0.5 pl-2">
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onSelectFile={onSelectFile}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border px-3 py-2">
        <p className="truncate text-[10px] font-mono text-muted-foreground">{version.version}</p>
      </div>
    </aside>
  );
}

function FileTreeNode({
  node,
  depth,
  activeFile,
  expandedFolders,
  onSelectFile,
  onToggleFolder,
}: {
  node: EditorFileNode;
  depth: number;
  activeFile: string;
  expandedFolders: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
}) {
  const isFolder = node.type === 'folder';
  const expanded = expandedFolders.has(node.path);
  const isActive = !isFolder && activeFile === node.path;
  const isImage = node.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);

  if (isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/60"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 shrink-0 transition-transform',
              expanded && 'rotate-90',
            )}
          />
          <Folder className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{node.name}</span>
        </button>
        {expanded &&
          node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onSelectFile={onSelectFile}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectFile(node.path)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
        isActive
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      {isImage ? (
        <ImageIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <File className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{node.name}</span>
    </button>
  );
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
