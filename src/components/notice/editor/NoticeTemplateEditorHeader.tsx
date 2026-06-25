import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NoticeConfigRecord } from '@/types';

interface NoticeTemplateEditorHeaderProps {
  noticeName: string;
  listUrl: string;
  mappingPageUrl: string;
  linkedConfigId?: string;
  linkedConfig?: NoticeConfigRecord;
  linkedConfigFile: string;
  configPageUrl: string;
  linkConfigUrl: string;
}

export function NoticeTemplateEditorHeader({
  noticeName,
  listUrl,
  mappingPageUrl,
  linkedConfigId,
  linkedConfig,
  linkedConfigFile,
  configPageUrl,
  linkConfigUrl,
}: NoticeTemplateEditorHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="h-8 shrink-0">
          <Link to={listUrl}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Templates
          </Link>
        </Button>

        <div className="h-5 w-px bg-border" />

        <p className="truncate text-sm font-semibold">{noticeName}</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Link
          to={mappingPageUrl}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
        >
          <Map className="h-3 w-3" />
          Template mapping
        </Link>
        {linkedConfigId && linkedConfig ? (
          <Link
            to={configPageUrl}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="hidden sm:inline">Config:</span>
            <span className="font-mono text-foreground">{linkedConfigFile}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <Link
            to={linkConfigUrl}
            className="rounded-md border border-dashed border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Link config →
          </Link>
        )}
      </div>
    </header>
  );
}
