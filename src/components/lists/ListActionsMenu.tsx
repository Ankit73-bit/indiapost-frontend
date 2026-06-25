import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListActionsMenuContent } from '@/components/lists/ListActionsMenuContent';
import {
  useListActionsMenu,
  type ListActionsMenuProps,
} from '@/components/lists/useListActionsMenu';

export type { ListActionsMenuProps } from '@/components/lists/listActionsMenu.types';

export function ListActionsMenu(props: ListActionsMenuProps) {
  const { list, isAdmin, uploading, onUpload } = props;
  const { isBusy, canSync, fileInputRef } = useListActionsMenu(list, isAdmin);

  return (
    <DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        disabled={isBusy || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">List actions</span>
        </Button>
      </DropdownMenuTrigger>
      <ListActionsMenuContent
        {...props}
        fileInputRef={fileInputRef}
        isBusy={isBusy}
        canSync={canSync}
      />
    </DropdownMenu>
  );
}
