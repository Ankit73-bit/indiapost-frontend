import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { TableShell } from '@/components/shared/TableShell';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { NoticeTemplateListRow } from '@/components/notice/NoticeTemplateListRow';
import type { NoticeTemplate, PaginationMeta } from '@/types';

type NoticeTemplatesTableProps = {
  isLoading: boolean;
  clientId: string | undefined;
  filtered: NoticeTemplate[];
  createUrl: string;
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onOpenTemplate: (id: string) => void;
  onOpenMapping: (templateId: string, version?: string) => void;
};

export function NoticeTemplatesTable({
  isLoading,
  clientId,
  filtered,
  createUrl,
  meta,
  onPageChange,
  onOpenTemplate,
  onOpenMapping,
}: NoticeTemplatesTableProps) {
  return (
    <TableShell
      footer={
        meta && meta.totalPages > 1 ? (
          <div className="px-4 pb-4">
            <Pagination meta={meta} onPageChange={onPageChange} />
          </div>
        ) : undefined
      }
    >
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Template name</th>
            <th className="px-4 py-3 font-medium">Notice ID</th>
            <th className="px-4 py-3 font-medium">Default version</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Versions</th>
            <th className="px-4 py-3 font-medium">Last updated</th>
            <th className="px-4 py-3 w-12" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              </td>
            </tr>
          ) : !clientId ? (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                Select a client to view templates.
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center">
                <p className="text-muted-foreground">No templates found.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to={createUrl}>Create your first template</Link>
                </Button>
              </td>
            </tr>
          ) : (
            filtered.map((template) => (
              <NoticeTemplateListRow
                key={template._id}
                template={template}
                onOpenTemplate={onOpenTemplate}
                onOpenMapping={onOpenMapping}
              />
            ))
          )}
        </tbody>
      </table>
    </TableShell>
  );
}
