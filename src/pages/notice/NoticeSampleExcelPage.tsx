import { Link } from 'react-router-dom';
import { AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { FileDropZone } from '@/components/notice/FileDropZone';
import { SampleExcelPreviewPanel } from '@/components/notice/sampleExcel/SampleExcelPreviewPanel';
import { SampleExcelValidationReport } from '@/components/notice/sampleExcel/SampleExcelValidationReport';
import { useNoticeSampleExcelPage } from '@/pages/notice/useNoticeSampleExcelPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function NoticeSampleExcelBlocked({
  listUrl,
  reason,
}: {
  listUrl: string;
  reason: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Sample Excel unavailable</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{reason}</p>
      <Button asChild variant="link" className="mt-4">
        <Link to={listUrl}>Back to templates</Link>
      </Button>
    </div>
  );
}

export function NoticeSampleExcelPage() {
  const page = useNoticeSampleExcelPage();

  if (page.templateLoading || page.configLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (page.templateError || !page.template) {
    return (
      <NoticeSampleExcelBlocked
        listUrl={page.listUrl}
        reason="Select a valid template before uploading a sample Excel file."
      />
    );
  }

  if (!page.template.linkedConfigId || !page.linkedConfig) {
    return (
      <NoticeSampleExcelBlocked
        listUrl={page.listUrl}
        reason="Assign a config file to this template before uploading sample Excel."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sample Excel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Validate Excel headers against the linked config for{' '}
            <span className="font-medium text-foreground">{page.template.noticeName}</span>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={page.listUrl}>Back to templates</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Linked config</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Config file</p>
            <p className="font-mono font-medium">{page.linkedConfig.configFileName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sample file</p>
            <p className="font-medium">
              {page.linkedConfig.sampleExcelFileName ?? 'Not uploaded yet'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            {page.isValidated && !page.pendingSave ? (
              <Badge className="mt-1">Validated</Badge>
            ) : page.pendingSave ? (
              <Badge variant="secondary" className="mt-1">
                Ready to save
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-1">
                Pending validation
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {page.showUploadSection ? (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Required Excel columns</CardTitle>
            </CardHeader>
            <CardContent>
              {page.requiredColumns.length ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {page.requiredColumns.map((column) => {
                      const isIndexed = page.indexedColumns.includes(column);
                      return (
                        <Badge key={column} variant="outline" className="font-mono text-xs">
                          {column}
                          {isIndexed ? '_N' : ''}
                        </Badge>
                      );
                    })}
                  </div>
                  {page.indexedColumns.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Table and list fields use a row suffix in Excel headers (for example{' '}
                      <span className="font-mono">branch_name_1</span>,{' '}
                      <span className="font-mono">branch_name_2</span>).
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No columns required.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="h-4 w-4" />
                Upload sample Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileDropZone
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                acceptLabel="Excel (.xlsx, .xls)"
                files={page.excelFile ? [page.excelFile] : []}
                multiple={false}
                onFilesChange={(files) => page.setExcelFile(files[0] ?? null)}
                emptyHint={`Upload a sample Excel file (max ${page.maxRows} data rows) to validate its header row`}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!page.canValidate || page.validating}
                  onClick={() => void page.handleValidate()}
                >
                  {page.validating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Validate headers
                </Button>
              </div>
            </CardContent>
          </Card>

          {page.validation && !page.validation.isValid ? (
            <SampleExcelValidationReport validation={page.validation} />
          ) : null}
        </>
      ) : null}

      {page.showPreviewSection ? (
        <>
          <SampleExcelPreviewPanel
            preview={page.preview}
            visibleColumns={page.visibleColumns}
            onVisibleColumnsChange={page.setVisibleColumns}
            loading={page.previewLoading}
            fileName={
              page.pendingSave && page.excelFile
                ? page.excelFile.name
                : page.linkedConfig.sampleExcelFileName
            }
          />

          {page.pendingSave ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!page.canSave || page.saving}
                onClick={() => void page.handleSaveSample()}
              >
                {page.saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Save sample Excel
              </Button>
            </div>
          ) : null}

          {page.showUpdateSection ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileSpreadsheet className="h-4 w-4" />
                  Update sample Excel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a new file to replace the current sample Excel. The existing file
                  is kept until the new file passes validation and you confirm the update.
                </p>
                <FileDropZone
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  acceptLabel="Excel (.xlsx, .xls)"
                  files={page.excelFile ? [page.excelFile] : []}
                  multiple={false}
                  onFilesChange={(files) => page.setExcelFile(files[0] ?? null)}
                  emptyHint={`Choose a replacement file (max ${page.maxRows} data rows)`}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!page.canValidate || page.validating}
                    onClick={() => void page.handleValidate()}
                  >
                    {page.validating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Validate headers
                  </Button>
                  <Button
                    type="button"
                    disabled={!page.canUpdate || page.saving}
                    onClick={() => void page.handleUpdateSample()}
                  >
                    {page.saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Update sample Excel
                  </Button>
                  <Button type="button" variant="ghost" onClick={page.cancelUpdate}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : page.isValidated ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={page.startUpdate}>
                Update sample Excel
              </Button>
            </div>
          ) : null}

          {page.validation && (page.showUpdateSection || page.pendingSave) ? (
            <SampleExcelValidationReport validation={page.validation} />
          ) : null}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Test PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a merged preview PDF using the template, linked config, and every
                row in the validated sample Excel.
              </p>
              <Button
                type="button"
                disabled={!page.canTestPdf || page.testPdfLoading}
                onClick={() => void page.handleTestPdf()}
              >
                {page.testPdfLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Test PDF
              </Button>
              {!page.canTestPdf && (
                <p className="text-xs text-muted-foreground">
                  {page.showUpdateSection
                    ? 'Finish or cancel the update before generating a test PDF.'
                    : page.pendingSave
                      ? 'Save the sample Excel before generating a test PDF.'
                      : 'Save a valid sample Excel before generating a test PDF.'}
                </p>
              )}
              {page.testPdfUrl && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    title="Test PDF preview"
                    src={page.testPdfUrl}
                    className="h-[min(70vh,720px)] w-full bg-muted"
                  />
                  <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                    {page.testPdfFileName}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
