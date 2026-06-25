import { FolderOpen } from 'lucide-react';
import { FileTreeNode } from './FileTreeNode';
import { FilesSidebarHeader } from './FilesSidebarHeader';
import { buildFileTree } from './filesSidebar.utils';
import type { FilesSidebarProps } from './filesSidebar.types';

export type { EditorFileNode } from './filesSidebar.types';
export {
  flattenImageFiles,
  flattenTypFiles,
  getDefaultFilePath,
} from './filesSidebar.utils';

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
  const tree = buildFileTree(version);

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card">
      <FilesSidebarHeader
        readOnly={readOnly}
        isUploading={isUploading}
        onUploadFiles={onUploadFiles}
      />

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
