import { useState } from 'react';
import { Link2, Loader2, Unlink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useLinkTemplateConfigMutation,
  useUnlinkTemplateConfigMutation,
} from '@/store/api/noticeConfigsApi';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import type { NoticeConfigRecord } from '@/types';

const NO_CONFIG_VALUE = '__none__';

export type LinkConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  linkedConfigId?: string;
  clientId: string;
  configs: NoticeConfigRecord[];
  onLinked?: () => void;
};

export function LinkConfigDialog({
  open,
  onOpenChange,
  templateId,
  linkedConfigId,
  clientId,
  configs,
  onLinked,
}: LinkConfigDialogProps) {
  const [selectedConfigId, setSelectedConfigId] = useState(
    linkedConfigId ?? NO_CONFIG_VALUE,
  );
  const [linkConfig, { isLoading: linking }] = useLinkTemplateConfigMutation();
  const [unlinkConfig, { isLoading: unlinking }] =
    useUnlinkTemplateConfigMutation();

  const busy = linking || unlinking;
  const linkedConfig = configs.find((config) => config._id === linkedConfigId);

  async function handleSave() {
    try {
      if (selectedConfigId === NO_CONFIG_VALUE) {
        if (!linkedConfigId) {
          onOpenChange(false);
          return;
        }
        await unlinkConfig(templateId).unwrap();
        toast.success('Config unlinked from template');
      } else if (selectedConfigId !== linkedConfigId) {
        await linkConfig({ templateId, configId: selectedConfigId }).unwrap();
        toast.success('Config linked to template');
      }
      onLinked?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update config link'));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setSelectedConfigId(linkedConfigId ?? NO_CONFIG_VALUE);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link config</DialogTitle>
          <DialogDescription>
            Choose a config to link to this template. The config JSON is written
            into the template draft when linked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="link-config-select">Config</Label>
          <Select
            value={selectedConfigId}
            onValueChange={setSelectedConfigId}
            disabled={!clientId || busy}
          >
            <SelectTrigger id="link-config-select">
              <SelectValue placeholder="Select a config…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CONFIG_VALUE}>No config</SelectItem>
              {configs.map((config) => (
                <SelectItem key={config._id} value={config._id}>
                  {config.name} ({config.noticeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {linkedConfig && (
            <p className="text-xs text-muted-foreground">
              Currently linked: {linkedConfig.name}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={busy}>
            {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {!busy && selectedConfigId === NO_CONFIG_VALUE && linkedConfigId && (
              <Unlink className="mr-1.5 h-4 w-4" />
            )}
            {!busy && selectedConfigId !== NO_CONFIG_VALUE && (
              <Link2 className="mr-1.5 h-4 w-4" />
            )}
            {selectedConfigId === NO_CONFIG_VALUE && linkedConfigId
              ? 'Unlink'
              : 'Save link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
