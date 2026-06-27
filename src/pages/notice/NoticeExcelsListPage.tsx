import {
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNoticeExcelsListPage } from '@/hooks/useNoticeExcelsListPage';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useAppSelector } from '@/store';
import { NoticeExcelFormDialog } from '@/components/notice/excels/NoticeExcelFormDialog';
import { NoticeExcelTemplatePickerDialog } from '@/components/notice/excels/NoticeExcelTemplatePickerDialog';
import type { NoticeExcelRecord } from '@/types';

function statusBadge(status: NoticeExcelRecord['status']) {
  switch (status) {
    case 'VALIDATED':
      return <Badge className="bg-emerald-600/90 hover:bg-emerald-600">Validated</Badge>;
    case 'VALIDATION_FAILED':
      return <Badge variant="destructive">Validation Failed</Badge>;
    case 'PROCESSING':
      return <Badge variant="secondary">Processing</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function NoticeExcelsListPage() {
  const authUser = useAppSelector((s) => s.auth.user);
  const { activeClients } = useNoticeClientContext();
  const page = useNoticeExcelsListPage();

  const customerClient = activeClients.find((c) => c._id === authUser?.clientId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Excel files…"
            value={page.search}
            onChange={(e) => page.setSearch(e.target.value)}
            className="pl-9"
            disabled={!page.clientId}
          />
        </div>
        <Button onClick={page.openCreate} disabled={!page.clientId}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Excel
        </Button>
      </div>

      {!page.clientId ? (
        <EmptyState message="Select a client to manage Excel files." />
      ) : page.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : !page.data?.data.length ? (
        <EmptyState
          message="No Excel files yet."
          action={
            <Button size="sm" variant="outline" onClick={page.openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Excel
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Config</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-center">Generate</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.data.data.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">
                    {page.listDisplayName(record)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {record.templateName ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {record.configName ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.rowCount.toLocaleString()}
                  </TableCell>
                  <TableCell>{statusBadge(record.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={record.status !== 'VALIDATED'}
                      title="Generate PDFs"
                      onClick={() => page.openGenerator(record)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => page.openView(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => page.openReplace(record)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Replace Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={page.downloadingId === record._id}
                          onClick={() => void page.handleDownload(record)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NoticeExcelFormDialog
        open={page.dialogOpen}
        onOpenChange={page.handleDialogOpenChange}
        replacing={page.replacing}
        isAdmin={page.isAdmin}
        activeClients={activeClients}
        customerClient={customerClient}
        authClientId={authUser?.clientId ?? undefined}
        watchedClientId={page.watchedClientId}
        watchedNoticeType={page.watchedNoticeType}
        formClientId={page.formClientId}
        formNoticeTypesData={page.formNoticeTypesData}
        generatedSlugPreview={page.generatedSlugPreview}
        excelFile={page.excelFile}
        onExcelFile={page.setExcelFile}
        validation={page.validation}
        validating={page.validating}
        submitError={page.submitError}
        submitting={page.submitting}
        register={page.register}
        handleSubmit={page.handleSubmit}
        setValue={page.setValue}
        errors={page.errors}
        onSubmit={(values) => void page.onSubmit(values)}
      />

      <NoticeExcelTemplatePickerDialog
        open={page.templatePickerOpen}
        onOpenChange={page.setTemplatePickerOpen}
        templates={page.matchingTemplates}
        onSelect={(id) => void page.handleTemplatePick(id)}
        submitting={page.submitting}
      />
    </div>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
