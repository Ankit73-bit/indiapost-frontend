import {
  ChevronRight,
  File,
  Folder,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileTreeNodeProps } from './filesSidebar.types';

export function FileTreeNode({
  node,
  depth,
  activeFile,
  expandedFolders,
  onSelectFile,
  onToggleFolder,
}: FileTreeNodeProps) {
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
