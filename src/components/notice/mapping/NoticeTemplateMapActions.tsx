import { Download, Loader2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NoticeTemplateMapActionsProps } from '@/pages/notice/noticeTemplateMapPage.types';

export function NoticeTemplateMapActions({
  readOnly,
  dirty,
  isBusy,
  saving,
  importing,
  entriesCount,
  importRef,
  onImport,
  onSave,
  onExport,
}: NoticeTemplateMapActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={importRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImport(file);
          e.target.value = '';
        }}
      />
      {!readOnly && (
        <>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={isBusy}
            onClick={() => importRef.current?.click()}
          >
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Import template.json
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            disabled={!dirty || isBusy || entriesCount === 0}
            onClick={() => void onSave()}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save mappings
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="secondary"
        className="gap-1.5"
        disabled={isBusy || entriesCount === 0}
        onClick={() => void onExport()}
      >
        <Download className="h-3.5 w-3.5" />
        Export template.json
      </Button>
    </div>
  );
}

export function NoticeTemplateMapHelpText() {
  return (
    <p className="text-xs text-muted-foreground">
      Mappings are stored in the database per template version. Include{' '}
      <span className="font-mono">DEFAULT</span>, empty key, or{' '}
      <span className="font-mono">-</span> for the fallback .typ file. Excel rows use
      State/Language columns to pick the mapped file at generation time.
    </p>
  );
}
