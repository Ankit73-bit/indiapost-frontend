import type { CodeEditorStatusBarProps } from './codeEditorPane.types';

export function CodeEditorStatusBar({
  projectName,
  activeTab,
  readOnly,
  linkedConfigFile,
  onOpenConfig,
  lineCount,
}: CodeEditorStatusBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-1 text-[11px] text-muted-foreground">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate opacity-60">{projectName}</span>
        <span className="opacity-40">/</span>
        <span className="truncate font-medium text-foreground">
          {activeTab.split('/').pop()}
        </span>
        {readOnly && (
          <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
            read-only
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {linkedConfigFile && onOpenConfig && (
          <button
            type="button"
            onClick={onOpenConfig}
            className="font-mono text-primary hover:underline"
          >
            {linkedConfigFile}
          </button>
        )}
        <span className="tabular-nums">{lineCount} lines</span>
      </div>
    </div>
  );
}
