import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/toast';
import { downloadListExport } from '@/lib/exportList';
import {
  buildListName,
  buildListSlug,
  mergeNoticeTypes,
} from '@/lib/listNaming';
import { usePollListsWhileActive } from '@/hooks/usePollListsWhileActive';
import { useOperationsLists } from '@/hooks/useOperationsLists';
import { useTriggerSyncMutation } from '@/store/api/syncApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { useListClientsQuery } from '@/store/api/clientsApi';
import {
  listsApi,
  useListNoticeTypesQuery,
  useListYearsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useUploadListFileMutation,
  useCancelImportMutation,
  useCancelSyncMutation,
} from '@/store/api/listsApi';
import { getApiErrorMessage } from '@/lib/helpers';
import type { List } from '@/types';
import { listFormSchema } from '@/pages/lists/listForm.schema';
import {
  ALL_MONTHS,
  currentYear,
  MONTH_OPTIONS,
} from '@/pages/lists/listsPage.constants';
import type { FilterChip, ListFormValues } from '@/pages/lists/listsPage.types';

export function useListsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const sortOrder: 'asc' | 'desc' =
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

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
  const skipSearchDebounceRef = useRef(false);

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [opsPollForced, setOpsPollForced] = useState(false);

  useEffect(() => {
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false;
      return;
    }
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

  const { data: noticeTypesData } = useListNoticeTypesQuery(
    clientIdFilter ? { clientId: clientIdFilter } : undefined,
  );
  const { data: listYearsData } = useListYearsQuery(
    clientIdFilter ? { clientId: clientIdFilter } : undefined,
  );
  const noticeTypeOptions = useMemo(() => {
    const types = noticeTypesData ?? [];
    if (clientIdFilter) {
      return [
        ...new Set(types.map((t) => t.trim().toUpperCase()).filter(Boolean)),
      ].sort();
    }
    return mergeNoticeTypes(types);
  }, [noticeTypesData, clientIdFilter]);

  const {
    importing: importingLists,
    syncing: syncingLists,
    data: opsData,
  } = useOperationsLists({
    clientId: clientIdFilter,
    forcePoll: opsPollForced,
  });

  const { data, isLoading, isFetching } = usePollListsWhileActive(
    {
      clientId: clientIdFilter,
      search: search || undefined,
      year: showAllYears ? undefined : Number(filterYear),
      month: filterMonth ? Number(filterMonth) : undefined,
      noticeType: filterNoticeType || undefined,
      sortOrder,
      page,
      limit: 20,
    },
    { forcePoll: opsPollForced },
  );

  const prevSyncingCountRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevSyncingCountRef.current;
    prevSyncingCountRef.current = syncingLists.length;
    if (prev !== null && prev > 0 && syncingLists.length === 0) {
      dispatch(listsApi.util.invalidateTags([{ type: 'List', id: 'LIST' }]));
    }
  }, [syncingLists.length, dispatch]);

  const liveListById = useMemo(() => {
    const map = new Map<string, List>();
    for (const l of opsData?.data ?? []) {
      if (l.status === 'IMPORTING' || l.status === 'SYNCING') {
        map.set(l._id, l);
      }
    }
    for (const l of data?.data ?? []) map.set(l._id, l);
    return map;
  }, [opsData?.data, data?.data]);

  useEffect(() => {
    if (!opsPollForced) return;
    if (importingLists.length === 0 && syncingLists.length === 0) {
      const timer = setTimeout(() => setOpsPollForced(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [opsPollForced, importingLists.length, syncingLists.length]);

  const yearOptions = useMemo(() => {
    const current = currentYear();
    const years = new Set<number>([current]);
    for (let i = 1; i <= 3; i++) years.add(current - i);
    for (const y of listYearsData ?? []) years.add(y);
    return [...years].sort((a, b) => b - a);
  }, [listYearsData]);

  const isNonDefaultYear =
    showAllYears || (yearParam != null && yearParam !== String(currentYear()));

  const hasFilters = Boolean(
    search ||
    filterMonth ||
    filterNoticeType ||
    clientIdFilter ||
    isNonDefaultYear ||
    sortOrder === 'asc',
  );

  const filterActiveCount = [
    clientIdFilter,
    filterMonth,
    filterNoticeType,
    isNonDefaultYear,
  ].filter(Boolean).length;

  function applySearchParams(next: URLSearchParams) {
    setSearchParams(next, { replace: true });
    setPage(1);
  }

  function setClientFilter(clientId: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (clientId) next.set('clientId', clientId);
    else next.delete('clientId');
    applySearchParams(next);
  }

  function patchFilters(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    applySearchParams(next);
  }

  function clearSearch() {
    skipSearchDebounceRef.current = true;
    setSearchInput('');
    setSearch('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    applySearchParams(next);
  }

  function clearFilters() {
    skipSearchDebounceRef.current = true;
    setSearchInput('');
    setSearch('');
    const next = new URLSearchParams();
    next.set('year', String(currentYear()));
    applySearchParams(next);
  }

  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (search) {
      chips.push({
        key: 'search',
        label: `Search: ${search}`,
        onRemove: clearSearch,
      });
    }

    if (isAdmin && clientIdFilter) {
      const clientName =
        activeClients.find((c) => c._id === clientIdFilter)?.name ?? 'Client';
      chips.push({
        key: 'client',
        label: clientName,
        onRemove: () => setClientFilter(undefined),
      });
    }

    if (showAllYears) {
      chips.push({
        key: 'year',
        label: 'All years',
        onRemove: () => patchFilters({ year: String(currentYear()) }),
      });
    } else if (yearParam && yearParam !== String(currentYear())) {
      chips.push({
        key: 'year',
        label: `Year ${yearParam}`,
        onRemove: () => patchFilters({ year: String(currentYear()) }),
      });
    }

    if (filterMonth) {
      const monthLabel =
        MONTH_OPTIONS.find((m) => m.value === filterMonth)?.label ??
        `Month ${filterMonth}`;
      chips.push({
        key: 'month',
        label: monthLabel,
        onRemove: () => patchFilters({ month: null }),
      });
    }

    if (filterNoticeType) {
      chips.push({
        key: 'noticeType',
        label: filterNoticeType,
        onRemove: () => patchFilters({ noticeType: null }),
      });
    }

    if (sortOrder === 'asc') {
      chips.push({
        key: 'sort',
        label: 'Oldest first',
        onRemove: () => patchFilters({ sortOrder: null }),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    clientIdFilter,
    showAllYears,
    yearParam,
    filterMonth,
    filterNoticeType,
    sortOrder,
    isAdmin,
    activeClients,
  ]);

  function resolveClientSlug(clientId: string): string | undefined {
    return (
      activeClients.find((c) => c._id === clientId)?.slug ??
      clientsData?.data.find((c) => c._id === clientId)?.slug
    );
  }

  function buildNameFromValues(
    values: ListFormValues,
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
  } = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: { clientId: clientIdFilter ?? '' },
  });

  const watchedClientId = watch('clientId');
  const watchedNoticeType = watch('noticeType');
  const watchedNoticeName = watch('noticeName');
  const watchedNoticeDate = watch('noticeDate');

  const formClientId = editing?.clientId ?? watchedClientId;
  const { data: formNoticeTypesData } = useListNoticeTypesQuery(
    formClientId ? { clientId: formClientId } : undefined,
    { skip: !dialogOpen || !formClientId },
  );

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

  async function onSubmit(values: ListFormValues) {
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

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setSubmitError('');
  }

  function handleDeleteClick(list: List) {
    setDeleteError('');
    setDeleteTarget(list);
  }

  function handleCancelImportClose() {
    setCancelImportTarget(null);
    setCancelError('');
  }

  function handleCancelSyncClose() {
    setCancelSyncTarget(null);
    setCancelError('');
  }

  return {
    navigate,
    isAdmin,
    authUser,
    searchParams,
    clientIdFilter,
    yearParam,
    showAllYears,
    filterYear,
    filterMonth,
    filterNoticeType,
    sortOrder,
    page,
    setPage,
    searchInput,
    setSearchInput,
    search,
    dialogOpen,
    editing,
    submitError,
    uploadingListId,
    deleteTarget,
    setDeleteTarget,
    deleteError,
    cancelImportTarget,
    cancelSyncTarget,
    syncTarget,
    setSyncTarget,
    cancelError,
    uploadError,
    exportingListId,
    exportDialogOpen,
    setExportDialogOpen,
    clientsData,
    activeClients,
    customerClient,
    customerInactive,
    noticeTypeOptions,
    importingLists,
    syncingLists,
    data,
    isLoading,
    isFetching,
    liveListById,
    yearOptions,
    hasFilters,
    filterActiveCount,
    activeFilterChips,
    setClientFilter,
    patchFilters,
    clearSearch,
    clearFilters,
    creating,
    updating,
    deleting,
    cancellingImport,
    cancellingSync,
    triggeringSync,
    register,
    handleSubmit,
    setValue,
    errors,
    watchedClientId,
    watchedNoticeType,
    formClientId,
    formNoticeTypesData,
    generatedSlugPreview,
    openCreate,
    openEdit,
    onSubmit,
    handleFileUpload,
    handleDeleteList,
    handleCancelImport,
    handleCancelSync,
    handleExport,
    handleTriggerSync,
    handleDialogOpenChange,
    handleDeleteClick,
    handleCancelImportClose,
    handleCancelSyncClose,
    setCancelImportTarget,
    setCancelSyncTarget,
  };
}

export type UseListsPageReturn = ReturnType<typeof useListsPage>;
