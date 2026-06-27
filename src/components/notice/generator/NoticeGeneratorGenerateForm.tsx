import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoticeGeneratorGenerateFormProps {
  excelName: string;
  templateName: string;
  templateVersion: string;
  configName: string;
  rowCount: number;
  canGenerate: boolean;
  prerequisiteError: string | null;
  mergePdfs: boolean;
  includeIndividualPdfs: boolean;
  onMergePdfsChange: (value: boolean) => void;
  onIncludeIndividualPdfsChange: (value: boolean) => void;
  onGenerate: () => void;
}

export function NoticeGeneratorGenerateForm({
  excelName,
  templateName,
  templateVersion,
  configName,
  rowCount,
  canGenerate,
  prerequisiteError,
  mergePdfs,
  includeIndividualPdfs,
  onMergePdfsChange,
  onIncludeIndividualPdfsChange,
  onGenerate,
}: NoticeGeneratorGenerateFormProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Selected Excel</h2>
          <p className="text-xs text-muted-foreground">
            PDF generation uses the validated Excel and its associated template and config.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              Excel:{' '}
              <span className="font-medium text-foreground">{excelName}</span>
            </span>
            <span className="text-muted-foreground">
              Rows:{' '}
              <span className="font-mono font-medium text-foreground">
                {rowCount.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-foreground">
              Template:{' '}
              <span className="font-medium text-foreground">{templateName}</span>
            </span>
            <span className="text-muted-foreground">
              Config:{' '}
              <span className="font-medium text-foreground">{configName}</span>
            </span>
            <span className="text-muted-foreground">
              Version:{' '}
              <span className="font-mono font-medium text-foreground">
                {templateVersion}
              </span>
            </span>
          </div>
        </div>
      </section>

      {prerequisiteError && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{prerequisiteError}</span>
        </div>
      )}

      <div className="border-t border-border" />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Generation options</h2>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={includeIndividualPdfs}
            onChange={(event) => onIncludeIndividualPdfsChange(event.target.checked)}
            disabled={!canGenerate}
          />
          <span>
            <span className="font-medium">Include individual PDFs</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Keeps row-level PDFs in the ZIP (selected by default).
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={mergePdfs}
            onChange={(event) => onMergePdfsChange(event.target.checked)}
            disabled={!canGenerate}
          />
          <span>
            <span className="font-medium">Merge PDFs into batches</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Combines individual notices into merged batch files (500 per file by default),
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
      </section>
    </div>
  );
}
