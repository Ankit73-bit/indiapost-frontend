import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NoticeConfigFormValues } from '@/lib/noticeConfig';
import type { NoticeTemplateVersion } from '@/types';

interface NoticeTemplateVersionMetaStripProps {
  detailVersion: NoticeTemplateVersion;
  typFileNames: string[];
  imageFileNames: string[];
  configForm: NoticeConfigFormValues;
  savingLayout: boolean;
  onWithHeaderChange: (withHeader: boolean) => void;
}

export function NoticeTemplateVersionMetaStrip({
  detailVersion,
  typFileNames,
  imageFileNames,
  configForm,
  savingLayout,
  onWithHeaderChange,
}: NoticeTemplateVersionMetaStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-2.5">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="font-mono text-[11px]">
          id: {detailVersion.noticeConfig.id_field}
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {detailVersion.noticeConfig.date_output_style ?? 'dd-mm-yyyy'}
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {typFileNames.length} .typ
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {imageFileNames.length} img
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          {detailVersion.metadata.variables.length} vars
        </Badge>
        {(detailVersion.noticeConfig.tables?.length ?? 0) > 0 && (
          <Badge variant="outline" className="text-[11px]">
            {detailVersion.noticeConfig.tables!.length} tables
          </Badge>
        )}
        {(detailVersion.noticeConfig.list_fields?.length ?? 0) > 0 && (
          <Badge variant="outline" className="text-[11px]">
            {detailVersion.noticeConfig.list_fields!.length} lists
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Header</span>
        <div className="flex overflow-hidden rounded-md border border-border">
          {([false, true] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              disabled={savingLayout}
              onClick={() => void onWithHeaderChange(v)}
              className={cn(
                'px-3 py-1 text-xs transition-colors',
                configForm.with_header === v
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/60',
              )}
            >
              {v ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {savingLayout && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
