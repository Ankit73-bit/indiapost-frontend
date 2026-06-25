import { TableShell } from '@/components/shared/TableShell';
import { ListsPageTableRow } from '@/components/lists/ListsPageTableRow';
import {
  ListsPageTableFooter,
  ListsPageTableHeader,
} from '@/components/lists/ListsPageTableHeader';
import { ListsPageTableBodyStates } from '@/components/lists/ListsPageTableBodyStates';
import { listDisplayName } from '@/lib/listNaming';
import type { ListsPageTableProps } from '@/components/lists/listsPageTable.types';

export function ListsPageTable(props: ListsPageTableProps) {
  const {
    data,
    meta,
    isLoading,
    hasFilters,
    liveListById,
    activeClients,
    allClients,
    isAdmin,
    uploadingListId,
    exportingListId,
    triggeringSync,
    onPageChange,
    onRowClick,
    onUpload,
    onExport,
    onOpenPdfs,
    onTriggerSync,
    onEdit,
    onDelete,
    onCancelImport,
    onCancelSync,
  } = props;

  return (
    <TableShell
      minWidthClass="min-w-[960px]"
      footer={
        meta && meta.total > 0 ? (
          <ListsPageTableFooter meta={meta} onPageChange={onPageChange} />
        ) : undefined
      }
    >
      <table className="w-full text-sm">
        <ListsPageTableHeader />
        <tbody>
          <ListsPageTableBodyStates
            isLoading={isLoading}
            isEmpty={!isLoading && (data?.length ?? 0) === 0}
            hasFilters={hasFilters}
          />
          {data?.map((row) => {
            const list = liveListById.get(row._id) ?? row;
            return (
              <ListsPageTableRow
                key={list._id}
                list={list}
                activeClients={activeClients}
                allClients={allClients}
                isAdmin={isAdmin}
                uploading={uploadingListId === list._id}
                exporting={exportingListId === list._id}
                triggeringSync={triggeringSync}
                onRowClick={onRowClick}
                onUpload={(file) => onUpload(list._id, file)}
                onExport={() => onExport(list._id, listDisplayName(list))}
                onOpenPdfs={() => onOpenPdfs(list)}
                onTriggerSync={() => onTriggerSync(list)}
                onEdit={() => onEdit(list)}
                onDelete={() => onDelete(list)}
                onCancelImport={() => onCancelImport(list)}
                onCancelSync={() => onCancelSync(list)}
              />
            );
          })}
        </tbody>
      </table>
    </TableShell>
  );
}
