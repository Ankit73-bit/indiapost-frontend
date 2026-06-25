import { Eye, FileCode2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CodeEditorTabBarProps } from './codeEditorPane.types';

export function CodeEditorTabBar({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  isTypFile,
  previewOpen,
  onTogglePreview,
  readOnly,
  isSaving,
  onSave,
}: CodeEditorTabBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-2 py-0">
      <div className="flex min-w-0 items-center gap-0 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.path === activeTab;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => onTabSelect(tab.path)}
              className={cn(
                'group relative inline-flex max-w-[200px] items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition-colors',
                active
                  ? 'border-primary bg-background text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              <FileCode2 className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-primary' : '')} />
              <span className="truncate font-medium">{tab.label}</span>
              {tab.dirty && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                  title="Unsaved changes"
                />
              )}
              {tabs.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.path);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onTabClose(tab.path);
                    }
                  }}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                  aria-label="Close tab"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1 pr-1">
        <Button
          type="button"
          size="sm"
          variant={previewOpen ? 'secondary' : 'ghost'}
          className={cn('h-8 gap-1.5 text-xs', previewOpen && 'bg-primary/10 text-primary')}
          disabled={!isTypFile}
          onClick={onTogglePreview}
        >
          <Eye className="h-3.5 w-3.5" />
          {previewOpen ? 'Hide preview' : 'Preview'}
        </Button>

        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs"
            disabled={readOnly || isSaving}
            onClick={onSave}
            title="Save file (Ctrl+S)"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
            <kbd className="hidden rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              ⌘S
            </kbd>
          </Button>
        )}
      </div>
    </div>
  );
}
