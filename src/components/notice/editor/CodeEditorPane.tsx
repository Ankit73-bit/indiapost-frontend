import { useEffect, useMemo, useRef } from 'react';
import { Eye, FileCode2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface OpenTab {
  path: string;
  label: string;
  dirty?: boolean;
}

interface CodeEditorPaneProps {
  projectName: string;
  tabs: OpenTab[];
  activeTab: string;
  content: string;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (value: string) => void;
  onSave?: () => void;
  onTogglePreview?: () => void;
  previewOpen?: boolean;
  readOnly?: boolean;
  isSaving?: boolean;
  linkedConfigFile?: string;
  onOpenConfig?: () => void;
}

export function CodeEditorPane({
  projectName,
  tabs,
  activeTab,
  content,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSave,
  onTogglePreview,
  previewOpen,
  readOnly,
  isSaving,
  linkedConfigFile,
  onOpenConfig,
}: CodeEditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCount = Math.max(content.split('\n').length, 1);
  const lines = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount],
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const syncScroll = () => {
      const gutter = el.previousElementSibling as HTMLElement | null;
      if (gutter) gutter.scrollTop = el.scrollTop;
    };
    el.addEventListener('scroll', syncScroll);
    return () => el.removeEventListener('scroll', syncScroll);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+S / Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!readOnly && onSave) onSave();
      }
      // Tab key inserts spaces instead of losing focus
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal = el.value.substring(0, start) + '  ' + el.value.substring(end);
        onContentChange(newVal);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2;
        });
      }
    },
    [readOnly, onSave, onContentChange],
  );

  const isTypFile = activeTab.endsWith('.typ');
  const lineCol = ''; // could track cursor position if desired

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[hsl(var(--background))]">
      {/* Tab bar */}
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
                <span className="truncate font-medium">
                  {tab.label}
                </span>
                {tab.dirty && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" title="Unsaved changes" />
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

      {/* Breadcrumb / status bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate opacity-60">{projectName}</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground truncate">{activeTab.split('/').pop()}</span>
          {readOnly && (
            <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
              read-only
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
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

      {/* Editor area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="w-12 shrink-0 overflow-hidden border-r border-border bg-muted/20 py-3 text-right font-mono text-xs leading-6 text-muted-foreground/50 select-none">
            {lines.map((n) => (
              <div key={n} className="pr-3">
                {n}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            readOnly={readOnly}
            spellCheck={false}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'min-h-0 flex-1 resize-none overflow-auto px-4 py-3 font-mono text-[13px] leading-6 text-foreground outline-none',
              readOnly ? 'bg-muted/10 cursor-default' : 'bg-transparent',
            )}
            placeholder={readOnly ? '' : '// Start typing your Typst template...'}
          />
        </div>
      </div>
    </div>
  );
}
