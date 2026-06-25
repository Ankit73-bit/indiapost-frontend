import { Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NoticeConfigEditorHeaderProps } from '@/pages/notice/noticeConfigPage.types';

export function NoticeConfigEditorHeader({
  isNew,
  title,
  noticeId,
  creating,
  saving,
  deleting,
  onCancel,
  onDelete,
  onSave,
}: NoticeConfigEditorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold">{isNew ? 'New config' : title}</h3>
        {!isNew && (
          <p className="font-mono text-xs text-muted-foreground">{noticeId}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {isNew && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {!isNew && (
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        )}
        <Button
          type="button"
          disabled={creating || saving}
          onClick={() => void onSave()}
        >
          {(creating || saving) && (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-1.5 h-4 w-4" />
          {isNew ? 'Create config' : 'Save config'}
        </Button>
      </div>
    </div>
  );
}
