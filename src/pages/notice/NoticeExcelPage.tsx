import { Link } from 'react-router-dom';
import { FileSpreadsheet, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableShell } from '@/components/shared/TableShell';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';

export function NoticeExcelPage() {
  const { clientId } = useNoticeClientContext();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Excel uploads</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload spreadsheet data, map columns, and queue notice PDF generation runs.
          </p>
        </div>
        <Button disabled title="Coming in the next phase">
          <Plus className="mr-2 h-4 w-4" />
          New upload
        </Button>
      </div>

      <TableShell>
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="rounded-full bg-muted p-4">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="max-w-md space-y-2">
            <p className="font-medium">No Excel batches yet</p>
            <p className="text-sm text-muted-foreground">
              This section will mirror the template workflow: upload a file, validate
              columns against your active notice config, then run batch PDF generation.
            </p>
          </div>
          {!clientId && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Select a client above to scope Excel uploads.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/notice-generator/templates">Go to templates</Link>
            </Button>
          </div>
        </div>
      </TableShell>
    </div>
  );
}
