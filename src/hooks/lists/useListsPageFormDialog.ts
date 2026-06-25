import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/toast';
import {
  buildListName,
  buildListSlug,
} from '@/lib/listNaming';
import {
  useListNoticeTypesQuery,
  useCreateListMutation,
  useUpdateListMutation,
} from '@/store/api/listsApi';
import { getApiErrorMessage } from '@/lib/helpers';
import type { AuthUser, Client, List, PaginationMeta } from '@/types';
import { listFormSchema } from '@/pages/lists/listForm.schema';
import type { ListFormValues } from '@/pages/lists/listsPage.types';

export function useListsPageFormDialog({
  isAdmin,
  authUser,
  clientIdFilter,
  activeClients,
  clientsData,
}: {
  isAdmin: boolean;
  authUser: AuthUser | null;
  clientIdFilter: string | undefined;
  activeClients: Client[];
  clientsData: { data: Client[]; meta?: PaginationMeta } | undefined;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<List | null>(null);
  const [submitError, setSubmitError] = useState('');

  const [createList, { isLoading: creating }] = useCreateListMutation();
  const [updateList, { isLoading: updating }] = useUpdateListMutation();

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

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setSubmitError('');
  }

  return {
    dialogOpen,
    editing,
    submitError,
    creating,
    updating,
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
    handleDialogOpenChange,
  };
}
