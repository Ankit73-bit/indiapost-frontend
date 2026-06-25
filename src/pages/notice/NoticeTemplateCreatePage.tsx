import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { CreateNoticeTemplateFlow } from '@/components/notice/CreateNoticeTemplateFlow';
import { useNoticeTemplateCreatePage } from './useNoticeTemplateCreatePage';

export function NoticeTemplateCreatePage() {
  const page = useNoticeTemplateCreatePage();

  return (
    <div className="space-y-6">
      <Link
        to={page.listUrl}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to templates
      </Link>

      <div>
        <h2 className="text-lg font-semibold">Create template</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Step 1: .typ files · Step 2: images. Link Excel mapping in Config after creation.
        </p>
      </div>

      {page.clientId ? (
        <CreateNoticeTemplateFlow clientId={page.clientId} isAdmin={page.isAdmin} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a client before creating a template.
        </p>
      )}
    </div>
  );
}
