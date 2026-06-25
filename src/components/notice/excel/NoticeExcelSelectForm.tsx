import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoticeExcelTemplateSelector } from '@/components/notice/excel/NoticeExcelTemplateSelector';
import { NoticeExcelDropZone } from '@/components/notice/excel/NoticeExcelDropZone';

interface NoticeExcelSelectFormProps {
  clientId: string;
  isAdmin: boolean;
  templateId: string;
  templateVersion: string;
  templateName: string;
  excelFile: File | null;
  canGenerate: boolean;
  mergePdfs: boolean;
  onMergePdfsChange: (value: boolean) => void;
  onTemplateChange: (templateId: string, version: string, name: string) => void;
  onExcelFile: (file: File) => void;
  onExcelClear: () => void;
  onGenerate: () => void;
}

export function NoticeExcelSelectForm({
  clientId,
  isAdmin,
  templateId,
  templateVersion,
  templateName,
  excelFile,
  canGenerate,
  mergePdfs,
  onMergePdfsChange,
  onTemplateChange,
  onExcelFile,
  onExcelClear,
  onGenerate,
}: NoticeExcelSelectFormProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">1. Select template</h2>
          <p className="text-xs text-muted-foreground">
            Only templates with an active version are shown.
          </p>
        </div>
        <NoticeExcelTemplateSelector
          clientId={clientId}
          isAdmin={isAdmin}
          value={templateId}
          onChange={onTemplateChange}
        />
      </section>

      <div className="border-t border-border" />

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">2. Upload Excel file</h2>
          <p className="text-xs text-muted-foreground">
            Each row will be compiled into a separate PDF using the active template
            version.
          </p>
        </div>
        <NoticeExcelDropZone
          file={excelFile}
          onFile={onExcelFile}
          onClear={onExcelClear}
          disabled={!templateId}
        />
        {!templateId && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Select a template above before uploading a file.
          </p>
        )}
      </section>

      <div className="border-t border-border" />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">3. Generate</h2>
        {templateId && templateVersion && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <span className="text-muted-foreground">
                Template:{' '}
                <span className="font-medium text-foreground">{templateName}</span>
              </span>
              <span className="text-muted-foreground">
                Version:{' '}
                <span className="font-mono font-medium text-foreground">
                  {templateVersion}
                </span>
              </span>
              {excelFile && (
                <span className="text-muted-foreground">
                  File:{' '}
                  <span className="font-medium text-foreground">{excelFile.name}</span>
                </span>
              )}
            </div>
          </div>
        )}
        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={mergePdfs}
            onChange={(event) => onMergePdfsChange(event.target.checked)}
          />
          <span>
            <span className="font-medium">Merge PDFs into batches</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Combines individual notices into merged_batch files (500 per file by default),
              sorted by SrNo or the template sort field.
            </span>
          </span>
        </label>
        <Button
          className="gap-2"
          disabled={!canGenerate}
          onClick={onGenerate}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Generate PDFs
        </Button>
        {!clientId && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Select a client to get started.
          </p>
        )}
      </section>
    </div>
  );
}
