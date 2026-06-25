import type { List } from '@/types';

interface ListFormDialogSlugPreviewProps {
  editing: List | null;
  generatedSlugPreview: string | null;
}

export function ListFormDialogSlugPreview({
  editing,
  generatedSlugPreview,
}: ListFormDialogSlugPreviewProps) {
  if (!generatedSlugPreview) return null;

  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">
        {editing ? 'Updated list name' : 'Generated list name'}
      </p>
      <p className="mt-1 font-mono text-xs break-all">{generatedSlugPreview}</p>
      {editing && editing.name !== generatedSlugPreview && (
        <p className="mt-1 text-xs text-muted-foreground">
          Current: {editing.name}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Format: client-noticetype-noticename-year-month-date
      </p>
    </div>
  );
}
