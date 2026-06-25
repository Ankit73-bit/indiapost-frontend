import { Map, MoreHorizontal, Star } from 'lucide-react';
import { NoticeVersionStatusBadge } from '@/components/notice/NoticeVersionStatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/helpers';
import type { NoticeTemplate } from '@/types';

type NoticeTemplateListRowProps = {
  template: NoticeTemplate;
  onOpenTemplate: (id: string) => void;
  onOpenMapping: (templateId: string, version?: string) => void;
};

export function NoticeTemplateListRow({
  template,
  onOpenTemplate,
  onOpenMapping,
}: NoticeTemplateListRowProps) {
  const activeVer = template.versions.find(
    (v) => v.version === template.activeVersion,
  );
  const hasDraft = template.versions.some((v) => v.status === 'draft');

  return (
    <tr
      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
      onClick={() => onOpenTemplate(template._id)}
    >
      <td className="px-4 py-3 font-medium">{template.noticeName}</td>
      <td className="px-4 py-3 font-mono text-xs">{template.noticeId}</td>
      <td className="px-4 py-3">
        {template.activeVersion ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            {template.activeVersion}
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {activeVer ? (
          <NoticeVersionStatusBadge status="active" showDefault />
        ) : hasDraft ? (
          <NoticeVersionStatusBadge status="draft" />
        ) : (
          <span className="text-xs text-muted-foreground">No default</span>
        )}
      </td>
      <td className="px-4 py-3">{template.versions.length}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(template.updatedAt)}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenTemplate(template._id)}>
              Open editor
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onOpenMapping(
                  template._id,
                  template.activeVersion ??
                    template.versions.find((v) => v.status === 'draft')?.version,
                )
              }
            >
              <Map className="mr-2 h-3.5 w-3.5" />
              Template mapping
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
