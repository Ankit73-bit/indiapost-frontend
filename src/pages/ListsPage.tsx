import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Archive,
  ArchiveRestore,
  Pencil,
  Loader2,
  Trash2,
  XCircle,
  FileText,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ConfirmActionDialog } from '@/components/shared/ConfirmActionDialog';
import { toast } from '@/lib/toast';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import {
  useListListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useArchiveListMutation,
  useUnarchiveListMutation,
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
} from '@/store/api/listsApi';
import { toSlug, formatDate, formatBytes, getApiErrorMessage } from '@/lib/helpers';
import type { List, NoticeType } from '@/types';

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  noticeType: z.enum(['DEMAND', 'LEGAL', 'REMINDER', 'CUSTOM']).optional(),
  noticeDate: z.string().min(1, 'Notice date is required'),
  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function importPercent(list: List): number {
  const p = list.importProgress;
  if (!p || p.totalRows <= 0) return 0;
  return Math.min(100, Math.round((p.processedRows / p.totalRows) * 100));
}

function syncPercent(list: List): number {
  const p = list.syncProgress;
  if (!p || p.totalArticles <= 0) return 0;
  return Math.min(100, Math.round((p.processedCount / p.totalArticles) * 100));
}

function isProgressStuck(
  progress?: { updatedAt?: string; startedAt: string },
): boolean {
  if (!progress) return false;
  const last = progress.updatedAt ?? progress.startedAt;
  return Date.now() - new Date(last).getTime() > 5 * 60 * 1000;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ListsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin');
  const clientIdFilter = searchParams.get('clientId') ?? undefined;
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<List | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [uploadingListId, setUploadingListId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<List | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [cancelImportTarget, setCancelImportTarget] = useState<List | null>(
    null,
  );
  const [cancelSyncTarget, setCancelSyncTarget] = useState<List | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [pollActiveOps, setPollActiveOps] = useState(false);

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data, isLoading } = useListListsQuery(
    {
      clientId: clientIdFilter,
      page,
      limit: 20,
    },
    { pollingInterval: pollActiveOps ? 3000 : 0 },
  );

  const importingLists = data?.data.filter((l) => l.status === 'IMPORTING') ?? [];
  const syncingLists = data?.data.filter((l) => l.status === 'SYNCING') ?? [];

  useEffect(() => {
    setPollActiveOps(importingLists.length > 0 || syncingLists.length > 0);
  }, [importingLists.length, syncingLists.length]);

  const [createList, { isLoading: creating }] = useCreateListMutation();
  const [updateList, { isLoading: updating }] = useUpdateListMutation();
  const [archiveList] = useArchiveListMutation();
  const [unarchiveList] = useUnarchiveListMutation();
  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [uploadFile, { isLoading: uploading }] = useUploadListFileMutation();
  const [cancelImport, { isLoading: cancellingImport }] =
    useCancelImportMutation();
  const [cancelSync, { isLoading: cancellingSync }] = useCancelSyncMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: clientIdFilter ?? '' },
  });

  function openCreate() {
    setEditing(null);
    setSubmitError('');
    reset({ clientId: clientIdFilter ?? '', name: '', slug: '' });
    setDialogOpen(true);
  }

  function openEdit(list: List) {
    setSubmitError('');
    setEditing(list);
    reset({
      clientId: list.clientId,
      name: list.name,
      slug: list.slug,
      noticeType: list.noticeType,
      noticeDate: list.noticeDate?.slice(0, 10),
      dispatchDate: list.dispatchDate?.slice(0, 10),
      description: list.description,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setSubmitError('');
    try {
      if (editing) {
        await updateList({ listId: editing._id, body: values }).unwrap();
        toast.success('List updated');
      } else {
        await createList(values).unwrap();
        toast.success('List created');
      }
      setDialogOpen(false);
      reset();
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, editing ? 'Failed to update list.' : 'Failed to create list.'),
      );
    }
  }

  async function handleFileUpload(listId: string, file: File) {
    setUploadingListId(listId);
    setUploadError('');
    try {
      await uploadFile({ listId, file }).unwrap();
      setPollActiveOps(true);
      toast.success('Import started — progress updates on this page');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to start import.');
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingListId(null);
    }
  }

  const [exportingListId, setExportingListId] = useState<string | null>(null);

  async function handleDeleteList() {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await deleteList(deleteTarget._id).unwrap();
      setDeleteTarget(null);
      toast.success('List deleted permanently');
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete list.'));
    }
  }

  async function handleCancelImport() {
    if (!cancelImportTarget) return;
    setCancelError('');
    try {
      await cancelImport(cancelImportTarget._id).unwrap();
      setCancelImportTarget(null);
      toast.success('Import cancelled — you can upload again');
    } catch (err) {
      setCancelError(getApiErrorMessage(err, 'Failed to cancel import.'));
    }
  }

  async function handleCancelSync() {
    if (!cancelSyncTarget) return;
    setCancelError('');
    try {
      await cancelSync(cancelSyncTarget._id).unwrap();
      setCancelSyncTarget(null);
      toast.success('Sync reset — you can trigger sync again');
    } catch (err) {
      setCancelError(getApiErrorMessage(err, 'Failed to reset sync.'));
    }
  }

  async function handleExport(listId: string, listName: string) {
    setExportingListId(listId);
    try {
      const token = localStorage.getItem('ip_token');
      const url = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/v1/lists/${listId}/export`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${listName.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setExportingListId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lists"
        description="Batches of postal articles grouped by dispatch event."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New List
          </Button>
        }
      />

      {importingLists.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">
            Import in progress ({importingLists.length} list
            {importingLists.length !== 1 ? 's' : ''})
          </p>
          <p className="mt-1 text-amber-800/90">
            Processing runs on the server — refreshing or closing this page does
            not stop it. Progress updates every few seconds below.
            {importingLists.some((l) => isProgressStuck(l.importProgress)) && (
              <span className="block mt-1 font-medium">
                Progress has not moved in 5+ minutes — use Cancel on the row to
                reset and upload again.
              </span>
            )}
          </p>
        </div>
      )}

      {syncingLists.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-medium">
            Sync in progress ({syncingLists.length} list
            {syncingLists.length !== 1 ? 's' : ''})
          </p>
          <p className="mt-1 text-blue-800/90">
            India Post tracking sync runs on the server. Progress updates every
            few seconds below.
          </p>
        </div>
      )}

      {uploadError && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Client
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Articles
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                Dispatch
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                File
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No lists found.
                </td>
              </tr>
            )}
            {data?.data.map((list) => (
              <tr
                key={list._id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer"
                onClick={() =>
                  navigate(
                    `/articles?clientId=${list.clientId}&listId=${list._id}`,
                  )
                }
              >
                <td className="px-4 py-3 font-medium">{list.name}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {clientsData?.data.find((c) => c._id === list.clientId)
                    ?.name ?? list.clientId.slice(-6)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {list.noticeType ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <ListStatusBadge status={list.status} />
                  {list.status === 'IMPORTING' && list.importProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-amber-200">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${importPercent(list)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {list.importProgress.processedRows.toLocaleString()} /{' '}
                        {list.importProgress.totalRows.toLocaleString()} rows
                        {(list.importProgress.failedRows ?? 0) > 0 && (
                          <span className="text-destructive">
                            {' '}
                            · {list.importProgress.failedRows} failed
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {list.status === 'SYNCING' && list.syncProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-blue-200">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${syncPercent(list)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {list.syncProgress.processedCount.toLocaleString()} /{' '}
                        {list.syncProgress.totalArticles.toLocaleString()}{' '}
                        articles
                        {list.syncProgress.failedCount > 0 && (
                          <span className="text-destructive">
                            {' '}
                            · {list.syncProgress.failedCount} failed
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {list.importError && (
                    <p className="mt-1 max-w-[180px] text-xs text-destructive">
                      {list.importError}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {list.totalArticles.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(list.dispatchDate)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {list.uploadedFile
                    ? `${list.uploadedFile.originalName} (${formatBytes(list.uploadedFile.sizeBytes)})`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div
                    className="flex justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAdmin && list.status === 'IMPORTING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        title="Cancel stuck import"
                        onClick={() => setCancelImportTarget(list)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {isAdmin && list.status === 'SYNCING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        title="Reset stuck sync"
                        onClick={() => setCancelSyncTarget(list)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {/* Upload */}
                    <label
                      className={
                        list.status === 'IMPORTING' || list.status === 'SYNCING'
                          ? 'cursor-not-allowed opacity-40'
                          : 'cursor-pointer'
                      }
                    >
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        disabled={
                          list.status === 'IMPORTING' ||
                          list.status === 'SYNCING'
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(list._id, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                        disabled={
                          uploadingListId === list._id ||
                          list.status === 'IMPORTING' ||
                          list.status === 'SYNCING'
                        }
                      >
                        <span>
                          {uploadingListId === list._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </Button>
                    </label>
                    {/* Export */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={exportingListId === list._id}
                      onClick={() => handleExport(list._id, list.name)}
                    >
                      {exportingListId === list._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {/* Tracking PDFs */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Tracking PDFs"
                      onClick={() =>
                        navigate(
                          `/articles?clientId=${list.clientId}&listId=${list._id}&pdfs=1`,
                        )
                      }
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(list)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {/* Archive / Unarchive (admin) */}
                    {isAdmin &&
                      (list.status === 'ARCHIVED' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-primary"
                          title="Unarchive list"
                          onClick={() => unarchiveList(list._id)}
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground"
                          title="Archive list"
                          onClick={() => archiveList(list._id)}
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        title="Delete list permanently"
                        onClick={() => {
                          setDeleteError('');
                          setDeleteTarget(list);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSubmitError('');
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit List' : 'New List'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select
                  onValueChange={(v) => setValue('clientId', v)}
                  defaultValue={clientIdFilter ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.data.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-xs text-destructive">
                    {errors.clientId.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Name</Label>
                <Input
                  placeholder="Aug 2025 Demand Notices"
                  {...register('name', {
                    onChange: (e) => {
                      if (!editing) setValue('slug', toSlug(e.target.value));
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Slug</Label>
                <Input placeholder="aug-2025-demand" {...register('slug')} />
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Notice Date</Label>
                <Input type="date" {...register('noticeDate')} />
                {errors.noticeDate && (
                  <p className="text-xs text-destructive">
                    {errors.noticeDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Dispatch Date</Label>
                <Input type="date" {...register('dispatchDate')} />
                {errors.dispatchDate && (
                  <p className="text-xs text-destructive">
                    {errors.dispatchDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>
                  Notice Type{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Select
                  onValueChange={(v) => setValue('noticeType', v as NoticeType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['DEMAND', 'LEGAL', 'REMINDER', 'CUSTOM'].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>
                  Description{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  placeholder="Brief description"
                  {...register('description')}
                />
              </div>
            </div>

            {submitError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? 'Save Changes' : 'Create List'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteList}
        title="Delete list"
        description="This permanently deletes the list, its uploaded file, all articles, and tracking history. This cannot be undone."
        entityName={deleteTarget?.name ?? ''}
        isLoading={deleting}
        error={deleteError}
      />

      <ConfirmActionDialog
        open={Boolean(cancelImportTarget)}
        onClose={() => {
          setCancelImportTarget(null);
          setCancelError('');
        }}
        onConfirm={handleCancelImport}
        title="Cancel import"
        description="Stops tracking this import in the UI. The server job may still finish in the background. You can upload the file again afterward."
        entityName={cancelImportTarget?.name ?? ''}
        confirmLabel="Cancel import"
        isLoading={cancellingImport}
        error={cancelError}
      />

      <ConfirmActionDialog
        open={Boolean(cancelSyncTarget)}
        onClose={() => {
          setCancelSyncTarget(null);
          setCancelError('');
        }}
        onConfirm={handleCancelSync}
        title="Reset sync status"
        description="Clears the stuck syncing state for this list. Trigger Sync again when ready."
        entityName={cancelSyncTarget?.name ?? ''}
        confirmLabel="Reset sync"
        isLoading={cancellingSync}
        error={cancelError}
      />
    </div>
  );
}
