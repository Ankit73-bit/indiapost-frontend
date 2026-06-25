import { FileText } from 'lucide-react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ListPdfsDialogHeaderProps {
  listName: string;
}

export function ListPdfsDialogHeader({ listName }: ListPdfsDialogHeaderProps) {
  return (
    <DialogHeader className="shrink-0 space-y-1 border-b border-border px-5 py-4">
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Tracking PDFs
      </DialogTitle>
      <DialogDescription>
        {listName} — PDFs are generated on demand with the latest tracking data.
      </DialogDescription>
    </DialogHeader>
  );
}
