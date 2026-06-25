import { cn } from '@/lib/utils';
import type { CodeEditorContentProps } from './codeEditorPane.types';

export function CodeEditorContent({
  lines,
  textareaRef,
  content,
  readOnly,
  onContentChange,
  onKeyDown,
}: CodeEditorContentProps) {
  return (
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
          onKeyDown={onKeyDown}
          className={cn(
            'min-h-0 flex-1 resize-none overflow-auto px-4 py-3 font-mono text-[13px] leading-6 text-foreground outline-none',
            readOnly ? 'cursor-default bg-muted/10' : 'bg-transparent',
          )}
          placeholder={readOnly ? '' : '// Start typing your Typst template...'}
        />
      </div>
    </div>
  );
}
