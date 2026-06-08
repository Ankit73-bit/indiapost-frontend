import { useState } from 'react';
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

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const { data, isLoading } = useListListsQuery({
    clientId: clientIdFilter,
    page,
    limit: 20,
  });

  const [createList, { isLoading: creating }] = useCreateListMutation();
  const [updateList, { isLoading: updating }] = useUpdateListMutation();
  const [archiveList] = useArchiveListMutation();
  const [unarchiveList] = useUnarchiveListMutation();
  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [uploadFile, { isLoading: uploading }] = useUploadListFileMutation();

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
      } else {
        await createList(values).unwrap();
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
    try {
      await uploadFile({ listId, file }).unwrap();
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
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete list.'));
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
                    {/* Upload */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
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
                        disabled={uploadingListId === list._id}
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
    </div>
  );
}
