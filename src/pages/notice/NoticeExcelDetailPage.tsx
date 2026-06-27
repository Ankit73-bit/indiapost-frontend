import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SampleExcelPreviewPanel } from '@/components/notice/sampleExcel/SampleExcelPreviewPanel';
import { useNoticeExcelDetailPage } from '@/hooks/useNoticeExcelDetailPage';
import { formatDate } from '@/lib/helpers';
import { listDisplayName } from '@/lib/listNaming';

export function NoticeExcelDetailPage() {
  const page = useNoticeExcelDetailPage();

  if (page.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (page.isError || !page.record) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to={page.listUrl}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Excel
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Excel record not found.</p>
      </div>
    );
  }

  const { record } = page;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to={page.listUrl}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Excel
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page.downloading || record.status !== 'VALIDATED'}
          onClick={() => void page.handleDownload()}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Download Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">File Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="Excel Name" value={listDisplayName(record)} />
          <InfoRow label="Template" value={record.templateName ?? '—'} />
          <InfoRow label="Config" value={record.configName ?? '—'} />
          <InfoRow label="Upload Date" value={formatDate(record.createdAt)} />
          <InfoRow label="Uploaded By" value={record.uploadedByName ?? record.uploadedBy ?? '—'} />
          <InfoRow label="Total Rows" value={record.rowCount.toLocaleString()} />
          <InfoRow
            label="Validation Status"
            value={
              record.status === 'VALIDATED' ? (
                <Badge className="bg-emerald-600/90">Validated</Badge>
              ) : record.status === 'VALIDATION_FAILED' ? (
                <Badge variant="destructive">Validation Failed</Badge>
              ) : (
                <Badge variant="secondary">Processing</Badge>
              )
            }
          />
          {record.excelFileName && (
            <InfoRow label="File" value={record.excelFileName} />
          )}
        </CardContent>
      </Card>

      <SampleExcelPreviewPanel
        preview={page.preview}
        visibleColumns={page.visibleColumns}
        onVisibleColumnsChange={page.setVisibleColumns}
        loading={page.previewLoading}
        fileName={record.excelFileName}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
