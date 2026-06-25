import { useCallback, useEffect, useMemo, useRef } from 'react';

export function useCodeEditorPane(
  content: string,
  readOnly: boolean | undefined,
  onSave: (() => void) | undefined,
  onContentChange: (value: string) => void,
) {
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
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!readOnly && onSave) onSave();
      }
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

  return { textareaRef, lineCount, lines, handleKeyDown };
}
