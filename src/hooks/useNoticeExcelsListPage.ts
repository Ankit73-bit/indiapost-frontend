import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNoticeClientContext } from '@/hooks/useNoticeClientContext';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useListNoticeTypesQuery } from '@/store/api/listsApi';
import {
  useListNoticeExcelsQuery,
  validateProductionExcelFile,
  createNoticeExcelRecord,
  replaceNoticeExcelFile,
  noticeExcelsApi,
} from '@/store/api/noticeExcelsApi';
import { buildListName, buildListSlug, listDisplayName } from '@/lib/listNaming';
import { getApiErrorMessage } from '@/lib/helpers';
import { toast } from '@/lib/toast';
import { useAppDispatch } from '@/store';
import {
  noticeExcelFormSchema,
  type NoticeExcelFormValues,
} from '@/pages/notice/noticeExcelForm.schema';
import type {
  MatchingTemplate,
  NoticeExcelRecord,
  SampleExcelValidationResult,
} from '@/types';

export function useNoticeExcelsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clientId, isAdmin, activeClients } = useNoticeClientContext();
  const { data: clientsData } = useListClientsQuery(
    { page: 1, limit: 200, isActive: true },
    { skip: !isAdmin },
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replacing, setReplacing] = useState<NoticeExcelRecord | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<SampleExcelValidationResult | null>(null);
  const [matchingTemplates, setMatchingTemplates] = useState<MatchingTemplate[]>([]);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<NoticeExcelFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useListNoticeExcelsQuery(
    { clientId, search: search || undefined, page, limit: 20 },
    { skip: !clientId },
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<NoticeExcelFormValues>({
    resolver: zodResolver(noticeExcelFormSchema),
    defaultValues: { clientId: clientId ?? '' },
  });

  const watchedClientId = watch('clientId');
  const watchedNoticeType = watch('noticeType');
  const watchedNoticeName = watch('noticeName');
  const watchedNoticeDate = watch('noticeDate');
  const formClientId = replacing?.clientId ?? watchedClientId;

  const { data: formNoticeTypesData } = useListNoticeTypesQuery(
    formClientId ? { clientId: formClientId } : undefined,
    { skip: !dialogOpen || !formClientId },
  );

  function resolveClientSlug(id: string): string | undefined {
    return (
      activeClients.find((c) => c._id === id)?.slug ??
      clientsData?.data.find((c) => c._id === id)?.slug
    );
  }

  const generatedSlugPreview = useMemo(() => {
    const id = replacing?.clientId ?? watchedClientId;
    const clientSlug = id ? resolveClientSlug(id) : undefined;
    if (!clientSlug || !watchedNoticeType || !watchedNoticeName || !watchedNoticeDate) {
      return null;
    }
    return buildListSlug({
      clientSlug,
      noticeType: watchedNoticeType,
      noticeDate: watchedNoticeDate,
      noticeName: watchedNoticeName,
    });
  }, [
    replacing?.clientId,
    watchedClientId,
    watchedNoticeType,
    watchedNoticeName,
    watchedNoticeDate,
    activeClients,
    clientsData?.data,
  ]);

  useEffect(() => {
    if (!dialogOpen || replacing) return;
    if (!isAdmin && clientId) {
      setValue('clientId', clientId);
    } else if (clientId && !watchedClientId) {
      setValue('clientId', clientId);
    }
  }, [dialogOpen, replacing, isAdmin, clientId, watchedClientId, setValue]);

  function openCreate() {
    setReplacing(null);
    setExcelFile(null);
    setValidation(null);
    setMatchingTemplates([]);
    setSubmitError('');
    reset({
      clientId: clientId ?? activeClients[0]?._id ?? '',
      noticeType: '',
      noticeName: '',
      noticeDate: '',
      dispatchDate: '',
      description: '',
    });
    setDialogOpen(true);
  }

  function openReplace(record: NoticeExcelRecord) {
    setReplacing(record);
    setExcelFile(null);
    setValidation(null);
    setMatchingTemplates([]);
    setSubmitError('');
    reset({
      clientId: record.clientId,
      noticeType: record.noticeType ?? '',
      noticeName: record.noticeName ?? record.name,
      noticeDate: record.noticeDate?.slice(0, 10) ?? '',
      dispatchDate: record.dispatchDate?.slice(0, 10) ?? '',
      description: record.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setSubmitError('');
      setReplacing(null);
      setExcelFile(null);
      setValidation(null);
    }
  }

  function handleExcelFile(file: File | null) {
    setExcelFile(file);
    setValidation(null);
    setMatchingTemplates([]);
  }

  async function runValidation(file: File, targetClientId: string) {
    setValidating(true);
    setValidation(null);
    setMatchingTemplates([]);
    try {
      const result = await validateProductionExcelFile(targetClientId, file);
      setValidation(result.validation);
      setMatchingTemplates(result.matchingTemplates);
      if (!result.isValid) {
        toast.error(result.error ?? 'Excel validation failed');
        return null;
      }
      return result;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Validation failed'));
      return null;
    } finally {
      setValidating(false);
    }
  }

  async function saveWithTemplate(
    values: NoticeExcelFormValues,
    templateId: string,
    file: File,
  ) {
    const targetClientId = replacing?.clientId ?? values.clientId;
    const clientSlug = resolveClientSlug(targetClientId);
    if (!clientSlug) {
      setSubmitError('Could not resolve client.');
      return;
    }

    const naming = {
      clientSlug,
      noticeType: values.noticeType,
      noticeDate: values.noticeDate,
      noticeName: values.noticeName,
    };

    setSubmitting(true);
    setSubmitError('');
    try {
      if (replacing) {
        await replaceNoticeExcelFile(replacing._id, file, templateId);
        toast.success('Excel replaced');
      } else {
        await createNoticeExcelRecord(
          {
            clientId: targetClientId,
            name: buildListName(naming),
            slug: buildListSlug(naming),
            noticeName: values.noticeName,
            noticeType: values.noticeType,
            noticeDate: values.noticeDate,
            dispatchDate: values.dispatchDate || undefined,
            description: values.description,
            templateId,
          },
          file,
        );
        toast.success('Excel created');
      }
      dispatch(noticeExcelsApi.util.invalidateTags([{ type: 'NoticeExcel', id: 'LIST' }]));
      setDialogOpen(false);
      void refetch();
    } catch (err) {
      const validationData = (err as { data?: SampleExcelValidationResult }).data;
      if (validationData) setValidation(validationData);
      setSubmitError(
        getApiErrorMessage(
          err,
          replacing ? 'Failed to replace Excel.' : 'Failed to create Excel.',
        ),
      );
    } finally {
      setSubmitting(false);
      setTemplatePickerOpen(false);
      setPendingValues(null);
    }
  }

  const onSubmit = useCallback(
    async (values: NoticeExcelFormValues) => {
      if (!excelFile) {
        setSubmitError('Upload an Excel file.');
        return;
      }

      const targetClientId = replacing?.clientId ?? values.clientId;
      const result = await runValidation(excelFile, targetClientId);
      if (!result) return;

      if (result.matchingTemplates.length === 0) {
        setSubmitError('No matching template found for this Excel file.');
        return;
      }

      if (result.matchingTemplates.length === 1) {
        await saveWithTemplate(
          values,
          result.matchingTemplates[0]!.templateId,
          excelFile,
        );
        return;
      }

      setPendingValues(values);
      setTemplatePickerOpen(true);
    },
    [excelFile, replacing],
  );

  async function handleTemplatePick(templateId: string) {
    if (!pendingValues || !excelFile) return;
    await saveWithTemplate(pendingValues, templateId, excelFile);
  }

  function openView(record: NoticeExcelRecord) {
    const url =
      isAdmin && clientId
        ? `/notice-generator/excel/${record._id}?clientId=${clientId}`
        : `/notice-generator/excel/${record._id}`;
    navigate(url);
  }

  function openGenerator(record: NoticeExcelRecord) {
    const url =
      isAdmin && clientId
        ? `/notice-generator/generator?excelId=${record._id}&clientId=${clientId}`
        : `/notice-generator/generator?excelId=${record._id}`;
    navigate(url);
  }

  async function handleDownload(record: NoticeExcelRecord) {
    setDownloadingId(record._id);
    try {
      const { downloadNoticeExcelFile } = await import('@/store/api/noticeExcelsApi');
      const result = await downloadNoticeExcelFile(record._id);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Download failed'));
    } finally {
      setDownloadingId(null);
    }
  }

  return {
    clientId,
    isAdmin,
    activeClients,
    search,
    setSearch,
    page,
    setPage,
    data,
    isLoading,
    isFetching,
    dialogOpen,
    replacing,
    excelFile,
    setExcelFile: handleExcelFile,
    validation,
    validating,
    matchingTemplates,
    templatePickerOpen,
    setTemplatePickerOpen,
    submitting,
    submitError,
    downloadingId,
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
    openReplace,
    handleDialogOpenChange,
    onSubmit,
    handleTemplatePick,
    openView,
    openGenerator,
    handleDownload,
    listDisplayName,
  };
}
