import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useNoticeGeneratorPage } from '@/hooks/useNoticeGeneratorPage';
import { NoticeExcelGeneratingState } from '@/components/notice/excel/NoticeExcelGeneratingState';
import { NoticeExcelDoneState } from '@/components/notice/excel/NoticeExcelDoneState';
import { NoticeExcelErrorState } from '@/components/notice/excel/NoticeExcelErrorState';
import { NoticeGeneratorGenerateForm } from '@/components/notice/generator/NoticeGeneratorGenerateForm';

export function NoticeGeneratorPage() {
  const { isAdmin, clientId } = useNoticeClientContext();
  const generator = useNoticeGeneratorPage();

  const listUrl =
    isAdmin && clientId
      ? `/notice-generator/excel?clientId=${clientId}`
      : '/notice-generator/excel';

  if (generator.excelLoading && generator.excelId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <Button asChild variant="ghost" size="sm">
        <Link to={listUrl}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Excel
        </Link>
      </Button>

      {generator.pageState === 'generating' && (
        <NoticeExcelGeneratingState
          excelFileName={generator.excelName}
          templateName={generator.templateName}
        />
      )}

      {generator.pageState === 'done' && (
        <NoticeExcelDoneState
          pdfCount={generator.pdfCount}
          rowCount={generator.generatedRowCount}
          individualPdfCount={generator.individualPdfCount}
          mergedPdfCount={generator.mergedPdfCount}
          mergePdfs={generator.mergePdfs}
          includeIndividualPdfs={generator.includeIndividualPdfs}
          blobUrl={generator.blobUrl}
          zipFileName={generator.zipFileName}
          onReset={generator.reset}
        />
      )}

      {generator.pageState === 'error' && (
        <NoticeExcelErrorState errorMsg={generator.errorMsg} onReset={generator.reset} />
      )}

      {(generator.pageState === 'select' || generator.pageState === 'error') && (
        <NoticeGeneratorGenerateForm
          excelName={generator.excelName || '—'}
          templateName={generator.templateName}
          templateVersion={generator.templateVersion || '—'}
          configName={generator.configName}
          rowCount={generator.rowCount}
          canGenerate={generator.canGenerate}
          prerequisiteError={generator.prerequisiteError}
          mergePdfs={generator.mergePdfs}
          includeIndividualPdfs={generator.includeIndividualPdfs}
          onMergePdfsChange={generator.setMergePdfs}
          onIncludeIndividualPdfsChange={generator.setIncludeIndividualPdfs}
          onGenerate={() => void generator.handleGenerate()}
        />
      )}
    </div>
  );
}
