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
import { ListTrackingRetentionBadge } from '@/components/shared/ListTrackingRetentionBadge';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ConfirmActionDialog } from '@/components/shared/ConfirmActionDialog';
import { ClientFilterSelect } from '@/components/shared/ClientFilterSelect';
import { NoticeTypeCombobox } from '@/components/shared/NoticeTypeCombobox';
import { OperationProgressBar } from '@/components/shared/OperationProgressBar';
import { ListActionsMenu } from '@/components/lists/ListActionsMenu';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import {
  buildListName,
  buildListSlug,
  listDisplayName,
  mergeNoticeTypes,
} from '@/lib/listNaming';
import {
  importPercent,
  syncPercent,
  isProgressStuck,
} from '@/lib/listProgress';
import { ListStatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import {
  usePollListsWhileActive,
  usePollListsByStatus,
} from '@/hooks/usePollListsWhileActive';
import { useTriggerSyncMutation } from '@/store/api/syncApi';
import { useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import {
  useListNoticeTypesQuery,
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
const VISIBILITY_ACTIVE = 'active';
const VISIBILITY_ARCHIVED = 'archived';

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
  const yearParam = searchParams.get('year');
  const showAllYears = yearParam === 'all';
  const filterYear = showAllYears
    ? String(currentYear())
    : (yearParam ?? String(currentYear()));
  const filterMonth = searchParams.get('month') ?? '';
  const filterNoticeType = searchParams.get('noticeType') ?? '';
  const showArchivedOnly =
    searchParams.get('visibility') === VISIBILITY_ARCHIVED;

  useEffect(() => {
    if (!searchParams.has('year')) {
      const next = new URLSearchParams(searchParams);
      next.set('year', String(currentYear()));
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('search') ?? '',
  );
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');

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
  const [opsPollForced, setOpsPollForced] = useState(false);

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

  const { data: noticeTypesData } = useListNoticeTypesQuery();
  const noticeTypeOptions = useMemo(
    () => mergeNoticeTypes(noticeTypesData),
    [noticeTypesData],
  );

  const { data: importingOps } = usePollListsByStatus(
    { clientId: clientIdFilter, status: 'IMPORTING', limit: 50 },
    opsPollForced,
  );
  const { data: syncingOps } = usePollListsByStatus(
    { clientId: clientIdFilter, status: 'SYNCING', limit: 50 },
    opsPollForced,
  );

  const { data, isLoading, isFetching } = usePollListsWhileActive(
    {
      clientId: clientIdFilter,
      search: search || undefined,
      year: showAllYears ? undefined : Number(filterYear),
      month: filterMonth ? Number(filterMonth) : undefined,
      noticeType: filterNoticeType || undefined,
      status: showArchivedOnly ? 'ARCHIVED' : undefined,
      page,
      limit: 20,
    },
    { forcePoll: opsPollForced },
  );

  const importingLists = importingOps?.data ?? [];
  const syncingLists = syncingOps?.data ?? [];

  const liveListById = useMemo(() => {
    const map = new Map<string, List>();
    for (const l of importingOps?.data ?? []) map.set(l._id, l);
    for (const l of syncingOps?.data ?? []) map.set(l._id, l);
    for (const l of data?.data ?? []) map.set(l._id, l);
    return map;
  }, [importingOps?.data, syncingOps?.data, data?.data]);

  useEffect(() => {
    if (!opsPollForced) return;
    if (importingLists.length === 0 && syncingLists.length === 0) {
      const timer = setTimeout(() => setOpsPollForced(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [opsPollForced, importingLists.length, syncingLists.length]);

  const yearOptions = useMemo(() => {
    const y = currentYear();
    return Array.from({ length: 8 }, (_, i) => y - i);
  }, []);

  const hasFilters = Boolean(
    search ||
    filterMonth ||
    filterNoticeType ||
    showArchivedOnly ||
    clientIdFilter ||
    showAllYears ||
    (!showAllYears &&
      yearParam !== null &&
      yearParam !== String(currentYear())),
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
    next.set('year', String(currentYear()));
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  function resolveClientSlug(clientId: string): string | undefined {
    return (
      activeClients.find((c) => c._id === clientId)?.slug ??
      clientsData?.data.find((c) => c._id === clientId)?.slug
    );
  }

  function buildNameFromValues(
    values: FormValues,
    clientId: string,
  ): string | null {
    const clientSlug = resolveClientSlug(clientId);
    if (!clientSlug) return null;
    return buildListName({
      clientSlug,
      noticeType: values.noticeType,
      noticeDate: values.noticeDate,
      noticeName: values.noticeName,
    });
  }

  const [createList, { isLoading: creating }] = useCreateListMutation();
  const [updateList, { isLoading: updating }] = useUpdateListMutation();
  const [archiveList] = useArchiveListMutation();
  const [deleteList, { isLoading: deleting }] = useDeleteListMutation();
  const [unarchiveList] = useUnarchiveListMutation();
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
    const clientId = editing?.clientId ?? watchedClientId;
    const clientSlug = clientId ? resolveClientSlug(clientId) : undefined;
    if (
      !clientSlug ||
      !watchedNoticeType ||
      !watchedNoticeName ||
      !watchedNoticeDate
    ) {
      return null;
    }
    return buildListSlug({
      clientSlug,
      noticeType: watchedNoticeType,
      noticeDate: watchedNoticeDate,
      noticeName: watchedNoticeName,
    });
  }, [
    editing?.clientId,
    activeClients,
    clientsData?.data,
    watchedClientId,
    watchedNoticeType,
    watchedNoticeName,
    watchedNoticeDate,
  ]);

  useEffect(() => {
    if (!dialogOpen || editing) return;

    if (!isAdmin && authUser?.clientId) {
      setValue('clientId', authUser.clientId);
      return;
    }

    const preferred = clientIdFilter ?? activeClients[0]?._id;
    if (preferred && !watchedClientId) {
      setValue('clientId', preferred);
    }
  }, [
    dialogOpen,
    editing,
    isAdmin,
    authUser?.clientId,
    clientIdFilter,
    activeClients,
    watchedClientId,
    setValue,
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
        const newName = buildNameFromValues(values, editing.clientId);
        if (!newName) {
          setSubmitError('Could not resolve client for this list.');
          return;
        }
        await updateList({
          listId: editing._id,
          body: {
            name: newName,
            noticeType: values.noticeType,
            noticeName: values.noticeName,
            noticeDate: values.noticeDate,
            dispatchDate: values.dispatchDate,
            description: values.description,
          },
        }).unwrap();
        toast.success('List updated');
      } else {
        const clientId = isAdmin ? values.clientId : (authUser?.clientId ?? '');
        const client = activeClients.find((c) => c._id === clientId);
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
          clientId,
          noticeType: values.noticeType,
          noticeName: values.noticeName,
          noticeDate: values.noticeDate,
          dispatchDate: values.dispatchDate,
          description: values.description,
          name: buildListName(naming),
          slug: buildListSlug(naming),
        }).unwrap();
        toast.success('List created');
      }
      setDialogOpen(false);
      reset();
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(
          err,
          editing ? 'Failed to update list.' : 'Failed to create list.',
        ),
      );
    }
  }

  async function handleFileUpload(listId: string, file: File) {
    setUploadingListId(listId);
    setUploadError('');
    setOpsPollForced(true);
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
      toast.success('List deleted');
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
    setOpsPollForced(true);
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
          value={showAllYears ? ALL_YEARS : filterYear}
          onValueChange={(v) =>
            patchFilters({ year: v === ALL_YEARS ? 'all' : v })
          }
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
            <SelectItem value={ALL_YEARS}>All years</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterMonth || ALL_MONTHS}
          onValueChange={(v) => {
            const month = v === ALL_MONTHS ? null : v;
            const updates: Record<string, string | null> = { month };
            if (month && (showAllYears || !searchParams.has('year'))) {
              updates.year = String(currentYear());
            }
            patchFilters(updates);
          }}
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
            {noticeTypeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={showArchivedOnly ? VISIBILITY_ARCHIVED : VISIBILITY_ACTIVE}
          onValueChange={(v) =>
            patchFilters({
              visibility: v === VISIBILITY_ACTIVE ? null : v,
              ...(v === VISIBILITY_ARCHIVED ? { year: 'all' } : {}),
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={VISIBILITY_ACTIVE}>Active</SelectItem>
            <SelectItem value={VISIBILITY_ARCHIVED}>Archived</SelectItem>
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
                Notice
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
            {data?.data.map((row) => {
              const list = liveListById.get(row._id) ?? row;
              return (
                <tr
                  key={list._id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/articles?clientId=${list.clientId}&listId=${list._id}`,
                    )
                  }
                >
                  <td className="px-4 py-3 font-medium text-xs">
                    {listDisplayName(list)}
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
                    {list.importError && (
                      <p className="mt-1 max-w-[180px] text-xs text-destructive">
                        {list.importError}
                      </p>
                    )}
                  </td>
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
                    {isAdmin && (
                      <ListTrackingRetentionBadge dispatchDate={list.dispatchDate} />
                    )}
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
                      onExport={() =>
                        handleExport(list._id, listDisplayName(list))
                      }
                      onOpenPdfs={() =>
                        navigate(
                          `/articles?clientId=${list.clientId}&listId=${list._id}&pdfs=1`,
                        )
                      }
                      onTriggerSync={() => setSyncTarget(list)}
                      onEdit={() => openEdit(list)}
                      onArchive={async () => {
                        try {
                          await archiveList(list._id).unwrap();
                          toast.success(
                            'List archived — switch to Archived to view or restore',
                          );
                        } catch (err) {
                          toast.apiError(err, 'Failed to archive list');
                        }
                      }}
                      onUnarchive={async () => {
                        try {
                          await unarchiveList(list._id).unwrap();
                          toast.success('List restored');
                        } catch (err) {
                          toast.apiError(err, 'Failed to restore list');
                        }
                      }}
                      onDelete={() => {
                        setDeleteError('');
                        setDeleteTarget(list);
                      }}
                      onCancelImport={() => setCancelImportTarget(list)}
                      onCancelSync={() => setCancelSyncTarget(list)}
                    />
                  </td>
                </tr>
              );
            })}
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
            {!editing && isAdmin && (
              <div className="space-y-1.5">
                <Label>
                  Client <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    activeClients.some((c) => c._id === watchedClientId)
                      ? watchedClientId
                      : undefined
                  }
                  onValueChange={(v) => setValue('clientId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients.length === 0 && (
                      <SelectItem value="__none__" disabled>
                        No active clients
                      </SelectItem>
                    )}
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

            {!editing && !isAdmin && authUser?.clientId && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Client: </span>
                <span className="font-medium">
                  {customerClient?.name ?? 'Your organization'}
                </span>
              </div>
            )}

            <NoticeTypeCombobox
              value={watchedNoticeType ?? ''}
              onChange={(v) =>
                setValue('noticeType', v, { shouldValidate: true })
              }
              knownTypes={noticeTypesData}
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

            {generatedSlugPreview && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {editing ? 'Updated list name' : 'Generated list name'}
                </p>
                <p className="mt-1 font-mono text-xs break-all">
                  {generatedSlugPreview}
                </p>
                {editing && editing.name !== generatedSlugPreview && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current: {editing.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Format: client-noticetype-noticename-year-month-date
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
        description="This will remove the list."
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
        title="Sync"
        description="Starts India Post tracking sync for all non-terminal articles in this list."
        entityName={syncTarget?.name ?? ''}
        confirmLabel="Start sync"
        isLoading={triggeringSync}
      />
    </div>
  );
}
