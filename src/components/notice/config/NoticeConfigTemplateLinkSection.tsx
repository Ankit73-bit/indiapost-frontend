import { Link } from 'react-router-dom';
import { ExternalLink, FileJson, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_CONFIG_FILE_NAME } from '@/components/notice/editor/editorUtils';
import { NO_TEMPLATE_SELECT_VALUE } from '@/pages/notice/noticeConfigPage.constants';
import type { NoticeConfigTemplateLinkSectionProps } from '@/pages/notice/noticeConfigPage.types';

export function NoticeConfigTemplateLinkSection({
  isNew,
  templates,
  linkTemplateId,
  onLinkTemplateIdChange,
  linkedTemplate,
  recordLinkedTemplateId,
  editorUrl,
  configFileName,
  onConfigFileNameChange,
  onLink,
  onUnlink,
  linking,
  unlinking,
}: NoticeConfigTemplateLinkSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2">
          <FileJson className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium">Template link</p>
            <p className="text-xs text-muted-foreground">
              Link this config to a template. The JSON file is written into the
              template draft when linked or saved.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Select
              value={linkTemplateId || NO_TEMPLATE_SELECT_VALUE}
              onValueChange={(v) =>
                onLinkTemplateIdChange(v === NO_TEMPLATE_SELECT_VALUE ? '' : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TEMPLATE_SELECT_VALUE}>No template</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.noticeName} ({t.noticeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isNew && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!linkTemplateId || linking}
                  onClick={() => void onLink()}
                >
                  Link
                </Button>
                {recordLinkedTemplateId && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={unlinking}
                    onClick={() => void onUnlink()}
                  >
                    <Unlink className="mr-1.5 h-4 w-4" />
                    Unlink
                  </Button>
                )}
              </div>
            )}
          </div>

          {linkedTemplate && recordLinkedTemplateId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Linked template:</span>
              <Link
                to={editorUrl(linkedTemplate._id)}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {linkedTemplate.noticeName}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cfg-file-name">Config JSON file name</Label>
            <Input
              id="cfg-file-name"
              value={configFileName}
              onChange={(e) => onConfigFileNameChange(e.target.value)}
              placeholder={DEFAULT_CONFIG_FILE_NAME}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
