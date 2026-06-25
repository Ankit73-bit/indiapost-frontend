export function NoticeTemplateEditorReadOnlyBanner() {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      This version is active and read-only — duplicate it to create a new draft.
    </div>
  );
}
