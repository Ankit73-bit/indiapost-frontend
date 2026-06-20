import { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const ALL_NOTICE_TYPES = '__all_types__';

interface SearchableNoticeTypeSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  portaled?: boolean;
}

export function SearchableNoticeTypeSelect({
  options,
  value,
  onChange,
  className,
  placeholder = 'All types',
  portaled = true,
}: SearchableNoticeTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 240 });

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !portaled) return;
    const anchor = containerRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 240),
    });
  }, [open, portaled]);

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return options;
    return options.filter((t) => t.toLowerCase().includes(q));
  }, [options, searchInput]);

  const selectedLabel =
    !value || value === ALL_NOTICE_TYPES ? placeholder : value;

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setSearchInput('');
  }

  const menu = open ? (
    <div
      ref={menuRef}
      data-searchable-select-menu
      className={cn(
        'z-[200] rounded-md border border-border bg-popover shadow-md',
        portaled ? 'fixed' : 'absolute left-0 right-0 top-full z-50 mt-1',
      )}
      style={
        portaled
          ? {
              top: position.top,
              left: position.left,
              width: position.width,
              maxWidth: 'calc(100vw - 1rem)',
            }
          : undefined
      }
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8 pl-7 text-xs"
            placeholder="Search notice types…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <ul className="max-h-[240px] overflow-y-auto py-1">
        <li>
          <button
            type="button"
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
              (!value || value === ALL_NOTICE_TYPES) && 'bg-muted/40',
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(ALL_NOTICE_TYPES)}
          >
            {placeholder}
          </button>
        </li>
        {filtered.map((t) => (
          <li key={t}>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-muted/50',
                value === t && 'bg-muted/40',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full min-w-0 justify-between gap-2 px-3 text-sm font-normal"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {portaled && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
