import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MatchingTemplate } from '@/types';

interface NoticeExcelTemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: MatchingTemplate[];
  onSelect: (templateId: string) => void;
  submitting?: boolean;
}

export function NoticeExcelTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  onSelect,
  submitting,
}: NoticeExcelTemplatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select template</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Multiple templates match this Excel file. Choose which template and config to
          associate.
        </p>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.templateId}
              type="button"
              disabled={submitting}
              className="flex w-full flex-col rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:opacity-50"
              onClick={() => onSelect(template.templateId)}
            >
              <span className="text-sm font-medium">{template.templateName}</span>
              <span className="text-xs text-muted-foreground">
                Config: {template.configName} · Version {template.activeVersion}
              </span>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
