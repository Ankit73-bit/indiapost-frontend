import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ListPdfsDialogBody } from '@/components/lists/ListPdfsDialogBody';
import type { ListPdfsDialogProps } from '@/components/lists/listPdfsDialog.types';
import { cn } from '@/lib/utils';

export function ListPdfsDialog({
  open,
  onClose,
  listId,
  clientId,
  ...rest
}: ListPdfsDialogProps) {
  const [viewingArticle, setViewingArticle] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setViewingArticle(null);
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[90dvh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh]',
          viewingArticle
            ? 'sm:w-[min(96vw,1200px)] sm:max-w-[min(96vw,1200px)]!'
            : 'sm:max-w-2xl!',
        )}
      >
        {open ? (
          <ListPdfsDialogBody
            key={`${listId}:${clientId}`}
            onClose={onClose}
            listId={listId}
            clientId={clientId}
            viewingArticle={viewingArticle}
            onViewingArticleChange={setViewingArticle}
            {...rest}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
