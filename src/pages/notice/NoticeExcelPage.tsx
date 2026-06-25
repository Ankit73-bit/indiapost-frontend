import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useNoticeExcelPage } from '@/hooks/useNoticeExcelPage';
import { NoticeExcelGeneratingState } from '@/components/notice/excel/NoticeExcelGeneratingState';
import { NoticeExcelDoneState } from '@/components/notice/excel/NoticeExcelDoneState';
import { NoticeExcelErrorState } from '@/components/notice/excel/NoticeExcelErrorState';
import { NoticeExcelSelectForm } from '@/components/notice/excel/NoticeExcelSelectForm';

export function NoticeExcelPage() {
  const { clientId, isAdmin } = useNoticeClientContext();
  const excel = useNoticeExcelPage(clientId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {excel.pageState === 'generating' && (
        <NoticeExcelGeneratingState
          excelFileName={excel.excelFile?.name}
          templateName={excel.templateName}
        />
      )}

      {excel.pageState === 'done' && (
        <NoticeExcelDoneState
          pdfCount={excel.pdfCount}
          rowCount={excel.rowCount}
          individualPdfCount={excel.individualPdfCount}
          mergedPdfCount={excel.mergedPdfCount}
          mergePdfs={excel.mergePdfs}
          blobUrl={excel.blobUrl}
          zipFileName={excel.zipFileName}
          onReset={excel.reset}
        />
      )}

      {excel.pageState === 'error' && (
        <NoticeExcelErrorState errorMsg={excel.errorMsg} onReset={excel.reset} />
      )}

      {(excel.pageState === 'select' || excel.pageState === 'error') && (
        <NoticeExcelSelectForm
          clientId={clientId}
          isAdmin={isAdmin}
          templateId={excel.templateId}
          templateVersion={excel.templateVersion}
          templateName={excel.templateName}
          excelFile={excel.excelFile}
          canGenerate={excel.canGenerate}
          mergePdfs={excel.mergePdfs}
          onMergePdfsChange={excel.setMergePdfs}
          onTemplateChange={excel.handleTemplateChange}
          onExcelFile={excel.setExcelFile}
          onExcelClear={() => excel.setExcelFile(null)}
          onGenerate={() => void excel.handleGenerate()}
        />
      )}
    </div>
  );
}
