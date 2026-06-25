interface NoticeTemplateMapNoTypFilesProps {
  onOpenEditor: () => void;
}

export function NoticeTemplateMapNoTypFiles({ onOpenEditor }: NoticeTemplateMapNoTypFilesProps) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
      No .typ files in this version.{' '}
      <button
        type="button"
        className="text-primary hover:underline"
        onClick={onOpenEditor}
      >
        Upload templates first
      </button>
    </div>
  );
}
