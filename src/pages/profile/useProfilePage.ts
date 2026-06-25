import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import {
  useGetMeQuery,
  useGetUserByIdQuery,
} from '@/store/api/usersApi';
import { useListClientsQuery } from '@/store/api/clientsApi';

export function useProfilePage() {
  const [searchParams] = useSearchParams();
  const editUserId = searchParams.get('userId');
  const authUser = useAppSelector((s) => s.auth.user);
  const isAdmin = authUser?.role === 'admin';

  const { data: selfData, isLoading: selfLoading } = useGetMeQuery();
  const { data: targetData, isLoading: targetLoading } = useGetUserByIdQuery(editUserId ?? '', {
    skip: !editUserId || !isAdmin,
  });
  const { data: clientsData } = useListClientsQuery({ limit: 100 }, { skip: !isAdmin });

  const isEditingOther = isAdmin && !!editUserId && editUserId !== authUser?.id;
  const profile = isEditingOther ? targetData : selfData;
  const isLoading = isEditingOther ? targetLoading : selfLoading;

  const clientName = profile?.clientId
    ? (clientsData?.data.find((c) => c._id === profile.clientId)?.name ?? profile.clientId.slice(-8))
    : null;

  return {
    editUserId,
    isEditingOther,
    profile,
    isLoading,
    clientName,
  };
}
