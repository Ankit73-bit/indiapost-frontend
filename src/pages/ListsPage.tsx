import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, X } from 'lucide-react';
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
import { ClientFilterSelect } from '@/components/shared/ClientFilterSelect';
import { NoticeTypeCombobox } from '@/components/shared/NoticeTypeCombobox';
import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import { ListActionsMenu } from '@/components/lists/ListActionsMenu';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import { buildListName, buildListSlug } from '@/lib/listNaming';
import {
  importPercent,
  syncPercent,
  isProgressStuck,
  importResultSummary,
} from '@/lib/listProgress';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import { usePollListsWhileActive } from '@/hooks/usePollListsWhileActive';
import { useTriggerSyncMutation } from '@/store/api/syncApi';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import {
  useCreateListMutation,
  useUpdateListMutation,
  useArchiveListMutation,
  useUnarchiveListMutation,
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
} from '@/store/api/listsApi';
import { formatDate, formatBytes, getApiErrorMessage } from '@/lib/helpers';
import type { List } from '@/types';

const ALL_MONTHS = '__all_months__';
const ALL_YEARS = '__all_years__';
const ALL_TYPES = '__all_types__';

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  noticeType: z.string().min(1, 'Notice type is required'),
  noticeName: z.string().min(1, 'Notice name is required'),
  noticeDate: z.string().min(1, 'Notice date is required'),
  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function currentYear(): number {
  return new Date().getFullYear();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ListsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';

  const clientIdFilter = searchParams.get('clientId') ?? undefined;
  const filterYear = searchParams.get('year') ?? '';
  const filterMonth = searchParams.get('month') ?? '';
  const filterNoticeType = searchParams.get('noticeType') ?? '';

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('search') ?? '',
  );
  const [search, setSearch] = useState(
    () => searchParams.get('search') ?? '',
  );

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
  const [syncTarget, setSyncTarget] = useState<List | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [exportingListId, setExportingListId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearch(trimmed);
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set('search', trimmed);
      else next.delete('search');
      setSearchParams(next, { replace: true });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: clientsData } = useListClientsQuery({ limit: 100 });
  const activeClients = useMemo(
    () => clientsData?.data.filter((c) => c.isActive) ?? [],
    [clientsData?.data],
  );

  const customerClient = !isAdmin
    ? clientsData?.data.find((c) => c._id === authUser?.clientId)
    : undefined;
  const customerInactive = Boolean(customerClient && !customerClient.isActive);

  const { data, isLoading, isFetching } = usePollListsWhileActive({
    clientId: clientIdFilter,
    search: search || undefined,
    year: filterYear ? Number(filterYear) : undefined,
    month: filterMonth ? Number(filterMonth) : undefined,
    noticeType: filterNoticeType || undefined,
    page,
    limit: 20,
  });

  const importingLists = data?.data.filter((l) => l.status === 'IMPORTING') ?? [];
  const syncingLists = data?.data.filter((l) => l.status === 'SYNCING') ?? [];

  const yearOptions = useMemo(() => {
    const y = currentYear();
    return Array.from({ length: 8 }, (_, i) => y - i);
  }, []);

  const hasFilters = Boolean(
    search || filterYear || filterMonth || filterNoticeType || clientIdFilter,
  );

  function setClientFilter(clientId: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (clientId) next.set('clientId', clientId);
    else next.delete('clientId');
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  function patchFilters(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    const next = new URLSearchParams();
    if (clientIdFilter) next.set('clientId', clientIdFilter);
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  const [createList, { isLoading: creating }] = useCreateListMutation();
  const [updateList, { isLoading: updating }] = useUpdateListMutation();
  const [archiveList] = useArchiveListMutation();
  const [unarchiveList] = useUnarchiveListMutation();
  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [uploadFile] = useUploadListFileMutation();
  const [cancelImport, { isLoading: cancellingImport }] =
    useCancelImportMutation();
  const [cancelSync, { isLoading: cancellingSync }] = useCancelSyncMutation();
  const [triggerSync, { isLoading: triggeringSync }] = useTriggerSyncMutation();

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

  const watchedClientId = watch('clientId');
  const watchedNoticeType = watch('noticeType');
  const watchedNoticeName = watch('noticeName');
  const watchedNoticeDate = watch('noticeDate');

  const generatedSlugPreview = useMemo(() => {
    if (editing) return null;
    const client = activeClients.find((c) => c._id === watchedClientId);
    if (!client || !watchedNoticeType || !watchedNoticeName || !watchedNoticeDate) {
      return null;
    }
    return buildListSlug({
      clientSlug: client.slug,
      noticeType: watchedNoticeType,
      noticeDate: watchedNoticeDate,
      noticeName: watchedNoticeName,
    });
  }, [
    editing,
    activeClients,
    watchedClientId,
    watchedNoticeType,
    watchedNoticeName,
    watchedNoticeDate,
  ]);

  function openCreate() {
    setEditing(null);
    setSubmitError('');
    reset({
      clientId: clientIdFilter ?? activeClients[0]?._id ?? '',
      noticeType: '',
      noticeName: '',
      noticeDate: '',
      dispatchDate: '',
      description: '',
    });
    setDialogOpen(true);
  }

  function openEdit(list: List) {
    setSubmitError('');
    setEditing(list);
    reset({
      clientId: list.clientId,
      noticeType: list.noticeType ?? '',
      noticeName: list.noticeName ?? list.name,
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
        await updateList({
          listId: editing._id,
          body: {
            noticeType: values.noticeType,
            noticeName: values.noticeName,
            noticeDate: values.noticeDate,
            dispatchDate: values.dispatchDate,
            description: values.description,
          },
        }).unwrap();
        toast.success('List updated');
      } else {
        const client = activeClients.find((c) => c._id === values.clientId);
        if (!client) {
          setSubmitError('Selected client is inactive or not found.');
          return;
        }
        const naming = {
          clientSlug: client.slug,
          noticeType: values.noticeType,
          noticeDate: values.noticeDate,
          noticeName: values.noticeName,
        };
        await createList({
          ...values,
          name: buildListName(naming),
          slug: buildListSlug(naming),
        }).unwrap();
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
      toast.success('Import started — progress updates on this page');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to start import.');
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingListId(null);
    }
  }

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
      await downloadListExport(listId, listName);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingListId(null);
    }
  }

  async function handleTriggerSync() {
    if (!syncTarget) return;
    try {
      const result = await triggerSync({
        clientId: syncTarget.clientId,
        listId: syncTarget._id,
      }).unwrap();
      toast.success(result.message);
      setSyncTarget(null);
    } catch (err) {
      toast.apiError(err, 'Failed to trigger sync');
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lists"
        description="Batches of postal articles grouped by dispatch event."
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <ClientFilterSelect
                clients={activeClients}
                value={clientIdFilter}
                onChange={setClientFilter}
              />
            )}
            <Button
              size="sm"
              onClick={openCreate}
              disabled={customerInactive || activeClients.length === 0}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New List
            </Button>
          </div>
        }
      />

      {customerInactive && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Your client account is deactivated. Lists are hidden until an admin
          reactivates the client.
        </div>
      )}

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
                Progress has not moved in 5+ minutes — use Cancel in the row
                menu to reset and upload again.
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

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by list name, client…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <Select
          value={filterYear || ALL_YEARS}
          onValueChange={(v) =>
            patchFilters({ year: v === ALL_YEARS ? null : v })
          }
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_YEARS}>All years</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterMonth || ALL_MONTHS}
          onValueChange={(v) =>
            patchFilters({ month: v === ALL_MONTHS ? null : v })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS}>All months</SelectItem>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterNoticeType || ALL_TYPES}
          onValueChange={(v) =>
            patchFilters({ noticeType: v === ALL_TYPES ? null : v })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Notice type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>All types</SelectItem>
            {['DEMAND', 'LEGAL', 'REMINDER', 'CUSTOM'].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}

        {data?.meta && (
          <span className="ml-auto text-xs text-muted-foreground">
            {data.meta.total.toLocaleString()} list
            {data.meta.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

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
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground w-12">
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
                  {hasFilters
                    ? 'No lists match your search or filters.'
                    : 'No lists found.'}
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
                <td className="px-4 py-3 font-medium font-mono text-xs">
                  {list.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {activeClients.find((c) => c._id === list.clientId)?.name ??
                    clientsData?.data.find((c) => c._id === list.clientId)
                      ?.name ??
                    list.clientId.slice(-6)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {list.noticeType ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <ListStatusBadge status={list.status} />
                  {list.status === 'IMPORTING' && list.importProgress && (
                    <div className="mt-2">
                      <OperationProgressBar
                        variant="import"
                        percent={importPercent(list)}
                        label={`${list.importProgress.processedRows.toLocaleString()} / ${list.importProgress.totalRows.toLocaleString()} rows${
                          (list.importProgress.failedRows ?? 0) > 0
                            ? ` · ${list.importProgress.failedRows} failed`
                            : ''
                        }`}
                      />
                    </div>
                  )}
                  {list.status === 'SYNCING' && list.syncProgress && (
                    <div className="mt-2">
                      <OperationProgressBar
                        variant="sync"
                        percent={syncPercent(list)}
                        label={`${list.syncProgress.processedCount.toLocaleString()} / ${list.syncProgress.totalArticles.toLocaleString()} articles${
                          list.syncProgress.failedCount > 0
                            ? ` · ${list.syncProgress.failedCount} failed`
                            : ''
                        }`}
                      />
                    </div>
                  )}
                  {list.status === 'ACTIVE' && importResultSummary(list) && (
                    <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                      {importResultSummary(list)}
                    </p>
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
                <td
                  className="px-4 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ListActionsMenu
                    list={list}
                    isAdmin={isAdmin}
                    uploading={uploadingListId === list._id}
                    exporting={exportingListId === list._id}
                    triggeringSync={triggeringSync}
                    onUpload={(file) => handleFileUpload(list._id, file)}
                    onExport={() => handleExport(list._id, list.name)}
                    onOpenPdfs={() =>
                      navigate(
                        `/articles?clientId=${list.clientId}&listId=${list._id}&pdfs=1`,
                      )
                    }
                    onTriggerSync={() => setSyncTarget(list)}
                    onEdit={() => openEdit(list)}
                    onArchive={() => archiveList(list._id)}
                    onUnarchive={() => unarchiveList(list._id)}
                    onDelete={() => {
                      setDeleteError('');
                      setDeleteTarget(list);
                    }}
                    onCancelImport={() => setCancelImportTarget(list)}
                    onCancelSync={() => setCancelSyncTarget(list)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.meta && data.meta.total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} ·{' '}
              {data.meta.total.toLocaleString()} total
            </p>
            {data.meta.totalPages > 1 && (
              <Pagination meta={data.meta} onPageChange={setPage} />
            )}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
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
                <Label>
                  Client <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watchedClientId}
                  onValueChange={(v) => setValue('clientId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients.map((c) => (
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

            {editing && (
              <div className="space-y-1.5">
                <Label>List name</Label>
                <Input value={editing.name} disabled className="font-mono text-xs" />
              </div>
            )}

            <NoticeTypeCombobox
              value={watchedNoticeType ?? ''}
              onChange={(v) => setValue('noticeType', v, { shouldValidate: true })}
              error={errors.noticeType?.message}
            />

            <div className="space-y-1.5">
              <Label>
                Notice Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. aug-demand-batch"
                {...register('noticeName')}
              />
              <p className="text-xs text-muted-foreground">
                Short label used in the generated list name (last segment).
              </p>
              {errors.noticeName && (
                <p className="text-xs text-destructive">
                  {errors.noticeName.message}
                </p>
              )}
            </div>

            {!editing && generatedSlugPreview && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Generated list name
                </p>
                <p className="mt-1 font-mono text-xs break-all">
                  {generatedSlugPreview}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Format: client-noticetype-year-month-date-noticename
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Notice Date <span className="text-destructive">*</span>
                </Label>
                <Input type="date" {...register('noticeDate')} />
                {errors.noticeDate && (
                  <p className="text-xs text-destructive">
                    {errors.noticeDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Dispatch Date <span className="text-destructive">*</span>
                </Label>
                <Input type="date" {...register('dispatchDate')} />
                {errors.dispatchDate && (
                  <p className="text-xs text-destructive">
                    {errors.dispatchDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                placeholder="Brief description"
                {...register('description')}
              />
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

      <ConfirmActionDialog
        open={Boolean(syncTarget)}
        onClose={() => setSyncTarget(null)}
        onConfirm={handleTriggerSync}
        title="Trigger sync"
        description="Starts India Post tracking sync for all non-terminal articles in this list."
        entityName={syncTarget?.name ?? ''}
        confirmLabel="Start sync"
        isLoading={triggeringSync}
      />
    </div>
  );
}
