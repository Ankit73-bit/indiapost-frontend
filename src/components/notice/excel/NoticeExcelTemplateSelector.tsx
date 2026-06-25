import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useListNoticeTemplatesQuery } from '@/store/api/noticeTemplatesApi';

interface NoticeExcelTemplateSelectorProps {
  clientId: string;
  isAdmin: boolean;
  value: string;
  onChange: (templateId: string, version: string, name: string) => void;
}

export function NoticeExcelTemplateSelector({
  clientId,
  isAdmin,
  value,
  onChange,
}: NoticeExcelTemplateSelectorProps) {
  const { data, isLoading } = useListNoticeTemplatesQuery(
    { clientId, limit: 100 },
    { skip: !clientId },
  );

  const templates = (data?.data ?? []).filter((t) => t.activeVersion);

  if (!clientId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a client above to see available templates.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading templates…
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        <p>No templates with an active version found for this client.</p>
        <Link
          to={
            isAdmin && clientId
              ? `/notice-generator/templates?clientId=${clientId}`
              : '/notice-generator/templates'
          }
          className="text-primary hover:underline"
        >
          Go to templates →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => {
        const selected = value === t._id;
        return (
          <button
            key={t._id}
            type="button"
            onClick={() => onChange(t._id, t.activeVersion!, t.noticeName)}
            className={cn(
              'group flex flex-col gap-1 rounded-lg border p-3 text-left transition-all',
              selected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  selected ? 'text-foreground' : 'text-foreground/80',
                )}
              >
                {t.noticeName}
              </p>
              {selected && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">{t.noticeId}</p>
            <span className="mt-1 inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              {t.activeVersion} · active
            </span>
          </button>
        );
      })}
    </div>
  );
}
