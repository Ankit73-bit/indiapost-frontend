import { ListTrackingRetentionBadge } from '@/components/shared/ListTrackingRetentionBadge';
import { ListActionsMenu } from '@/components/lists/ListActionsMenu';
import { ListsPageTableStatusCell } from '@/components/lists/ListsPageTableStatusCell';
import { listDisplayName } from '@/lib/listNaming';
import { formatDate, formatBytes } from '@/lib/helpers';
import type { ListsPageTableRowProps } from '@/components/lists/listsPageTable.types';

export function ListsPageTableRow({
  list,
  activeClients,
  allClients,
  isAdmin,
  uploading,
  exporting,
  triggeringSync,
  onRowClick,
  onUpload,
  onExport,
  onOpenPdfs,
  onTriggerSync,
  onEdit,
  onDelete,
  onCancelImport,
  onCancelSync,
}: ListsPageTableRowProps) {
  return (
    <tr
      className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer"
      onClick={() => onRowClick(list)}
    >
      <td className="px-4 py-3 font-medium text-xs">{listDisplayName(list)}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">
        {activeClients.find((c) => c._id === list.clientId)?.name ??
          allClients?.find((c) => c._id === list.clientId)?.name ??
          list.clientId.slice(-6)}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{list.noticeType ?? '—'}</td>
      <ListsPageTableStatusCell list={list} />
      <td className="px-4 py-3 text-right font-mono">
        <div>{list.totalArticles.toLocaleString()}</div>
        {list.status === 'IMPORTING' && list.importProgress && (
          <div className="mt-0.5 text-xs font-sans text-muted-foreground">
            of {list.importProgress.totalRows.toLocaleString()} rows
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <div>{formatDate(list.dispatchDate)}</div>
        {isAdmin && <ListTrackingRetentionBadge dispatchDate={list.dispatchDate} />}
      </td>
      <td className="px-4 py-3 text-muted-foreground text-xs">
        {list.uploadedFile
          ? `${list.uploadedFile.originalName} (${formatBytes(list.uploadedFile.sizeBytes)})`
          : '—'}
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <ListActionsMenu
          list={list}
          isAdmin={isAdmin}
          uploading={uploading}
          exporting={exporting}
          triggeringSync={triggeringSync}
          onUpload={onUpload}
          onExport={onExport}
          onOpenPdfs={onOpenPdfs}
          onTriggerSync={onTriggerSync}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancelImport={onCancelImport}
          onCancelSync={onCancelSync}
        />
      </td>
    </tr>
  );
}
